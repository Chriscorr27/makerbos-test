import json
import random
from xml.sax import xmlreader
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from  rest_framework.decorators import *
from .utils import *
import requests as req
from .models import *
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import xmltodict
import re

def getCarDetail(car):
    i =  car.toJson()	
    desc = "{brand} {model} is a {seat} seater Hatchback available in a price of ₹ {price} Lakh. It is available in 6 variants, {engine} cc engine options and 1 transmission option : Manual with {oil_type} variant. Other key specifications of the {model} include a Ground Clearance of 180 mm, Kerb Weight of 939 kg and Bootspace of 315 litres. The {model} is available in 10 colours. The mileage of {model} ranges from 19.4 kmpl to 19.8 kmpl.".format(
        brand=i["brand"],model=i["model"],seat=i["seats"],price=i["price"],engine=i["engine"],oil_type=i["oil_type"]
    )
    detail_card = "<img src='{}' style='background-color: rgb(156, 154, 154);'  class='card-img-top' alt='...'><h3 >{}</h3><p >{}</p><br><p >{}</p>".format(i["image"],i["brand"]+" "+i["model"],str(i["price"])+" Lakh "+"({}) - {} seater".format(i["engine"],i["seats"]),desc)
    return detail_card			


def format_carousals(cars,page=0,total=0,car_type=0):	
    car_types = ["carousel","slideshow","infocard"]
    slides = []								
    for car in cars:	
        i =  car.toJson()	
        buttons = []
        if car_type!=1:
            buttons = [ 
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
        slides.append({						
            "title":i["brand"]+" "+i["model"] ,
            "preview": 'landscape', 
            "card_style": car_types[car_type],
            "subtitle":str(i["price"])+" Lakh "+"({}) - {} seater".format(i["engine"],i["seats"]) if car_type!=1 else "",
            "image_url":i["image"],
            "url":"https://www.cardekho.com/{}/{}".format(i["brand"],i["model"]),
            "buttons":buttons
            })
    return {
        "entries":[
        {
        "template_type":"carousel",
        "shadow":True,
        "card_style": car_types[car_type],
        "preview": 'landscape', 
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
    reg_pattern = "^\d+-\d+$"
    car_type = request.GET.get('car_type',"").lower()
    car_brand = request.GET.get('car_brand',"").lower()
    car_price = request.GET.get('car_price',"").lower()
    page_op = request.GET.get('page_op',"").lower()
    limit = int(request.GET.get('limit',10))
    page = int(request.GET.get('page',1))
    data=[]
    total_page = 0
    query=[]
    if car_type=='new':
        car_type_query = "year>'{}'".format(2015)
        query.append(car_type_query)
    elif car_type=='old':
        car_type_query = "year<='{}'".format(2015)
        query.append(car_type_query)
    if car_brand!="":
        query.append("brand=='{}'".format(car_brand))
    if car_price!="" and re.search(reg_pattern,car_price):
        min_price,max_price = car_price.split("-")
        if int(min_price)>0:
            query.append("price>={}".format(int(min_price)))
        if int(max_price)<60:
            query.append("price<={}".format(int(max_price)))
    car_data = CarModel.objects.extra(where=query).order_by('price').reverse()
    # car_data.sort(key=lambda x: x.price, reverse=True)
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
    car_type = random.randint(0,2)
    data = format_carousals(data,page,total_page,car_type)
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
                        "buttons":[ 
                        {
                        "type":"go_to",
                        "next_block":"BookApointment",
                        "title":"Book Apointment",
                        }
                    ]
                    }
                ]
            }
    return JsonResponse(data,status=200,safe=False)

@api_view(["GET"])
def bookApointmentAPIView(request):
    car_id = request.GET.get('car_id',"")
    name = request.GET.get('name',"")
    phone = request.GET.get('mobile_number',"")
    email = request.GET.get('email_address',"")
    date = request.GET.get('date',"")
    car = CarModel.objects.filter(id=car_id).first()
    data = {}
    if car:
        car_json = car.toJson()
        html_content = render_to_string("after_booking.html", {
                                                    "name": name, "email": email,"phone": phone, "date": date, })
        text_content = strip_tags(html_content)
        email_obj = EmailMultiAlternatives(
            "Car Appointment",
            text_content,
            settings.EMAIL_HOST_USER,
            [email]
        )
        email_obj.attach_alternative(html_content, "text/html")
        email_obj.send()
        data = {
            "entries":[
                        {
                            "template_type":"message",
                            "message":"Booking successfully done<br>Booking details:<br>Name : {}<br>Phone : {}<br>Email : {}<br>Date : {}".format(name,phone,email,date),
                            "buttons":[ 
                            {
                            "type":"url",
                            "url":"https://www.cardekho.com/carmodels/{}/{}".format(car_json["brand"],car_json["model"]),
                            "webview_height":"new",
                            "title":"Check Car",
                            }
                        ]
                        }
                    ]
        }
    return JsonResponse(data,status=200,safe=False)

def filterCars(car_type,people_count,budget,uses):
    cars=[]
    query=[]
    if car_type=='new':
        car_type_query = "year>'{}'".format(2015)
        query.append(car_type_query)
    elif car_type=='old':
        car_type_query = "year<='{}'".format(2015)
        query.append(car_type_query)
    
    if people_count.lower()=='5+':
        query.append("seats>'{}'".format(5))
    elif people_count.lower()=='7+':
        query.append("seats>'{}'".format(7))
    
    if budget.lower()=='upto 10l':
        query.append("price<='{}'".format(10))
    elif budget.lower()=='upto 20l':
        query.append("price<='{}'".format(20))
    elif budget.lower()=='upto 40l':
        query.append("price<='{}'".format(40))
    elif budget.lower()=='upto 60l':
        query.append("price<='{}'".format(60))
    cars = CarModel.objects.extra(where=query)
    diesel_car = []
    petrol_car = []
    for car in cars:
        if car.oil_type.lower()=="diesel":
            diesel_car.append(car)
        elif car.oil_type.lower()=="petrol":
            petrol_car.append(car)
    if uses.lower()=="everyday" and len(diesel_car)<10:
        i=0
        while len(diesel_car)<10 and len(petrol_car)>i:
            diesel_car.append(petrol_car[i])
            i+=1
        cars = diesel_car
    elif uses.lower()=="weekend" and len(petrol_car)<10:
        i=0
        while len(petrol_car)<10 and len(diesel_car)>i:
            petrol_car.append(diesel_car[i])
            i+=1
        cars = petrol_car
    return cars

@api_view(["GET"])
def getSuggestionsAPIView(request):
    car_type = request.GET.get('car_type',"")
    people_count = request.GET.get('people_count',"")
    budget = request.GET.get('budget',"")
    uses = request.GET.get('uses',"")
    page_op = request.GET.get('page_op',"").lower()
    limit = int(request.GET.get('limit',10))
    page = int(request.GET.get('page',1))
    cars = filterCars(car_type,people_count,budget,uses)
    total_page = len(cars)/4
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
    data = cars[start_index:end_index]
    print(data)
    if len(data)>1:
        data = format_carousals(data,page,total_page)
    else:
        data = {
           "entries":[
            {
                "template_type":"message",
                "message":"Sorry we dont find any result",
            }
        ]
        }
    return JsonResponse(data,status=200,safe=False)
    
@api_view(["GET"])
def getPeopleCountAPIView(request):
    car_type = request.GET.get('car_type',"").lower()
    # print(car_id)
    data={}
    quick_reply = []
    if car_type=='new':
        car_seats = CarModel.objects.filter(year__gt=2015).values('seats').distinct()
        for car_seat in car_seats:
            if car_seat["seats"]==5:
                quick_reply.append({"name":"upto 5","new_states":[]})
            elif car_seat["seats"]==7:
                quick_reply.append({"name":"upto 7","new_states":[]})
            else:
                quick_reply.append({"name":"7+","new_states":[]})
    elif car_type=='old':
        car_seats = CarModel.objects.filter(year__lte=2015).values('seats').distinct()
        for car_seat in car_seats:
            if car_seat["seats"]==5:
                quick_reply.append({"name":"upto 5","new_states":[]})
            elif car_seat["seats"]==7:
                quick_reply.append({"name":"upto 7","new_states":[]})
            else:
                quick_reply.append({"name":"7+","new_states":[]})
    data = {
        "entries":[
            {
                "template_type":"message",
                "message":"How many people do you have in your family?",
            },{
                "template_type": "range",
                "max": 100,
                "min": 50,
                "title": "Pick range",
                "type": "single",
                "allow_skip": False
            }
        ]
    }
    
    return JsonResponse(data,status=200,safe=False)