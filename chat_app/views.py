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

def format_carousals(cars):								
	slides = []								
	for i in cars[:9]:							
		slides.append({						
				"title":i["car_name"],
				"subtitle":i["car_name"] +" "+ str(i["price"])+" Lakh "+"({})".format(i["engine"]),
				"image_url":i["img"],
                "buttons":[ 
                    {
                    "type":"url",
                    "url":i["img"],
                    "webview_height":"new",
                    "title":"Preview"
                    }
                ]
				})
	return {
		"entries":[
		{
		"template_type":"carousel",
		"shadow":True,
		"slides":slides	
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
def collectCars(request):
    headers = {
        "X-RapidAPI-Key": "55b6689c46msh94bae1227dbe83dp1b4268jsnb7b812a6f9fd",
        "X-RapidAPI-Host": "car-data.p.rapidapi.com"
    }
    url = "https://car-data.p.rapidapi.com/cars"
    querystring = {"limit":"10","page":"0","year":"2010","make":"BMW"}
    response = req.request("GET", url, headers=headers,params=querystring)
    data = json.loads(response.text)
    print(data)
    seats_list = [5,7]
    count =0
    for d in data:
        if  count<7:
            req_url ="http://www.carimagery.com/api.asmx/GetImageUrl?searchTerm={}+{}+{}".format(d["make"],d["model"],d["year"])
            img_res = req.request("GET",req_url , headers=headers,params=querystring)
            img_res = xmltodict.parse(img_res.text)
            image = img_res["string"]["#text"]
            # print(image)
            seats = random.randint(0,1)
            seats = seats_list[seats]
            engine = random.randint(1800,2000)
            price = 0
            # image = ""
            if seats==5:
                price = round(random.randint(120,240)*100/3)/100
            elif seats==7:
                price = round(random.randint(180,330)*100/3)/100
            else:
                price = round(random.randint(45,80)*100/3)/100
            price = round(price*0.65*100)/100
            car = CarModel(year=d["year"],brand=d["make"],model=d["model"],
            type=d["type"][0],price=price,engine=engine,seats=seats,image=image)
            # car.save()
            count+=1
    return JsonResponse({"msg":"collected"},status=200,safe=False)