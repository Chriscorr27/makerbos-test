import json
import random
from xml.sax import xmlreader
from django.http import JsonResponse
from django.shortcuts import render
from  rest_framework.decorators import *
from .utils import *
import requests as req
from .models import *
import xmltodict

def getCarDetail(car):
    i =  car.toJson()	
    desc = "Citroen C3 is a 5 seater Hatchback available in a price range of ₹ 5.71 - 8.06 Lakh. It is available in 6 variants, 1198 to 1199 cc engine options and 1 transmission option : Manual. Other key specifications of the C3 include a Ground Clearance of 180 mm, Kerb Weight of 939 kg and Bootspace of 315 litres. The C3 is available in 10 colours. The mileage of C3 ranges from 19.4 kmpl to 19.8 kmpl."
    detail_card = "<img src='{}' style='background-color: rgb(156, 154, 154);'  class='card-img-top' alt='...'><h3 >{}</h3><p >{}</p><br><p >{}</p>".format(i["image"],i["brand"]+" "+i["model"],str(i["price"])+" Lakh "+"({}) - {} seater".format(i["engine"],i["seats"]),desc)
    return detail_card			


def format_carousals(cars,page=0,total=0):								
    slides = []								
    for car in cars:	
        i =  car.toJson()	
        slides.append({						
            "title":i["brand"]+" "+i["model"] ,
            "subtitle":str(i["price"])+" Lakh "+"({}) - {} seater".format(i["engine"],i["seats"]),
            "image_url":i["image"],
            "buttons":[ 
                {
                "type":"go_to",
                "next_block":"car_deatil",
                "title":"Detail",
                "attrs":[
                {
                "name":"car_id",
                "value":str(i["id"])
                }
            ]
                }
            ]
            })
    return {
        "entries":[
        {
        "template_type":"carousel",
        "shadow":True,
        "slides":slides	
        },
        {
            "template_type":"message",
            "message":"{} / {} page".format(page,total)

        },
        {
            "template_type":"set_attr",
            "attributes":[
                {
                "attribute":"page",
                "value":str(page)
                }
            ]
        }
        ]
    }

def getCarByQuery(query="",car_name="",price="",engine=""):
    cars = getData()
    if query=="" or query.lower()=="all" :
        if car_name!="":
            cars = [c for c in cars if car_name.lower() in c["car_name"].lower()]
        if price!="" and float(price)>0:
            cars = [c for c in cars if float(price) == c["price"]]
        if engine!="" and float(engine)>0:
            cars = [c for c in cars if float(engine) == c["engine"]]
    else:
        all_queries = query.split(";")
        for q in all_queries:
            fields,value = q.split("=")
            field,opr = fields.split("__")
            if field=="car_name":
                cars = [c for c in cars if value.lower() in c["car_name"].lower()]
            elif field=="price" or field=="engine":
                if opr is None or opr.lower()=="eq":
                    cars = [c for c in cars if int(value) == c[field]]
                elif opr.lower()=="ne":
                    cars = [c for c in cars if int(value) != c[field]]
                elif opr.lower()=="gt":
                    cars = [c for c in cars if int(value) < c[field]]
                elif opr.lower()=="gte":
                    cars = [c for c in cars if int(value) <= c[field]]
                elif opr.lower()=="lt":
                    cars = [c for c in cars if int(value) > c[field]]
                elif opr.lower()=="lte":
                    cars = [c for c in cars if int(value) >= c[field]]
    return cars

@api_view(["GET"])
def go_toAPIView(request):
    go_to = request.GET.get("go_to","default")
    
    data={
            "entries":[
            {
                "template_type":"go_to",
                 "next_state":go_to,
                "go_to_blocks": [go_to], 
                "execution_type": "sequentially"
            }
        ]
    }
    return JsonResponse(data,status=200)

@api_view(["GET"])
def carousalAPIView(request):
    query = request.GET.get('query',"")
    car_name = request.GET.get('car_name',"")
    price = request.GET.get('price',"")
    engine = request.GET.get('engine',"")
    data ={}
    cars = getCarByQuery(query,car_name,price,engine)
    data =  format_carousals(cars)
    return JsonResponse(data,status=200)

@api_view(["GET"])
def videoAPIView(request):
    query = request.GET.get("query","")
    car_name = request.GET.get('car_name',"")
    price = request.GET.get('price',"")
    engine = request.GET.get('engine',"")
    data ={}
    cars = getCarByQuery(query,car_name,price,engine)
    if cars:
        index = random.randint(0,len(cars)-1)
        car = cars[index]
        data = {
            "entries":[
                {
                    "template_type":"video", 
                    "url":car["video"],
                }
            ]
        }
    else:
        data =  {
                "entries":[
                    {
                    "template_type":"message",
                    "message": "no Videos found"
                    }
                ]
            }
    return JsonResponse(data,status=200)

@api_view(["GET"])
def buttonAPIView(request):
    query = request.GET.get("query","")
    car_name = request.GET.get('car_name',"")
    price = request.GET.get('price',"")
    engine = request.GET.get('engine',"")
    data ={}
    cars = getCarByQuery(query,car_name,price,engine)
    if cars:
        index = random.randint(0,len(cars)-1)
        car = cars[index]
        data =  {
            "entries":[
                {
                    "template_type":"message",
                    "message":car["car_name"]+" cost " + str(car["price"])+" Lakh "+"({})".format(str(car["engine"]))+"\nclick the below button to view the car preview.",
                    "buttons":[  
                        {
                            "type":"url",
                            "url":car["img"],
                            "webview_height":"new", 
                            "title":"Preview img"
                        },
                        {
                            "type":"url",
                            "url":car["video"],
                            "webview_height":"full",
                            "title":"Preview video"
                        }
                    ]
                }
            ]
        }
    else:
        data =  {
            "entries":[
                {
                    "template_type":"message",
                    "message":"No Car found",
                }
            ]
        }
    return JsonResponse(data,status=200)

@api_view(["GET"])
def sendmessageAPIView(request):
    query = request.GET.get("query","")
    car_name = request.GET.get('car_name',"")
    price = request.GET.get('price',"")
    engine = request.GET.get('engine',"")
    data ={}
    cars = getCarByQuery(query,car_name,price,engine)
    if cars:
        index = random.randint(0,len(cars)-1)
        car = cars[index]
        data = {
                "entries":[
                    {
                        "template_type":"message",
                        "message":car["car_name"]+" cost " + car["price"]+" Lakh "+"({})".format(car["engine"]),
                    }
                ]
            }
    else:
        data = {
            "entries":[{
                "template_type":"message",
                "message":"Car not found",
            }]
        }
    return JsonResponse(data,status=200)

@api_view(["GET"])
def carBrandsAPIView(request):
    car_type = request.GET.get('car_type',"")
    data=[]
    if car_type=="new":
        cars_brand = CarModel.objects.filter(year__gte=2015).values('brand').distinct()
        # print(cars_brand)
        for brand in cars_brand:
            data.append( {"__display":brand["brand"], "code":brand["brand"].lower() },)
    elif car_type=="old":
        cars_brand = CarModel.objects.filter(year__lte=2015).values('brand').distinct()
        # print(cars_brand)
        for brand in cars_brand:
            data.append( {"__display":brand["brand"], "code":brand["brand"].lower() },)
    return JsonResponse(data,status=200,safe=False)

@api_view(["GET"])
def carBrandsAPIView(request):
    car_type = request.GET.get('car_type',"")
    data=[]
    if car_type=="new":
        cars_brand = CarModel.objects.filter(year__gte=2015).values('brand').distinct()
        # print(cars_brand)
        for brand in cars_brand:
            data.append( {"__display":brand["brand"], "code":brand["brand"].lower() },)
    elif car_type=="old":
        cars_brand = CarModel.objects.filter(year__lte=2015).values('brand').distinct()
        # print(cars_brand)
        for brand in cars_brand:
            data.append( {"__display":brand["brand"], "code":brand["brand"].lower() },)
    return JsonResponse(data,status=200,safe=False)

@api_view(["GET"])
def carListAPIView(request):
    car_type = request.GET.get('car_type',"").lower()
    car_brand = request.GET.get('car_brand',"").lower()
    page_op = request.GET.get('page_op',"").lower()
    limit = int(request.GET.get('limit',10))
    page = int(request.GET.get('page',1))
    data=[]
    
    total_page = 0
    if car_type=="new":
        car_data = CarModel.objects.filter(year__gte=2015,brand=car_brand)
        # print(len(car_brand))
        
        total_page = len(car_data)/4
        total_page = total_page if total_page%4==0 else int(total_page)+1
        if(page_op == "next"):
            page+=1
            if page>total_page:
                page = total_page
        elif page_op=="prev":
            page-=1
            if page<=0:
                page = 1
        start_index = limit*(page-1)
        end_index = limit*(page)
        data = car_data[start_index:end_index]
    elif car_type=="old":
        car_data = CarModel.objects.filter(year__lte=2015,brand=car_brand)
        total_page = len(car_data)/4
        total_page = total_page if total_page%4==0 else int(total_page)+1
        total_page = len(car_data)/4
        total_page = total_page if total_page%4==0 else int(total_page)+1
        if(page_op == "next"):
            page+=1
            if page>total_page:
                page = total_page
        elif page_op=="prev":
            page-=1
            if page<=0:
                page = 1
        start_index = limit*(page-1)
        end_index = limit*(page)
        data = car_data[start_index:end_index]
        # print(len(data))
    data = format_carousals(data,page,total_page)
    return JsonResponse(data,status=200,safe=False)

@api_view(["GET"])
def collectCars(request):
    cars = CarModel.objects.all()
    for car in cars:
        car.brand = car.brand.lower()
        car.save()
    return JsonResponse({"msg":"collected"},status=200,safe=False)

@api_view(["GET"])
def carDetailAPIView(request):
    car_id = request.GET.get('car_id',"")
    # print(car_id)
    data={}
    car = CarModel.objects.filter(id=car_id).first()
    # print(car)
    if car:
        data={
                "entries":[
                    {
                        "template_type":"message",
                        "message":getCarDetail(car),
                    }
                ]
            }
    return JsonResponse(data,status=200,safe=False)