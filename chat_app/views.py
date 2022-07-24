from django.http import JsonResponse
from django.shortcuts import render
from  rest_framework.decorators import *
from .utils import *

def format_carousals(cars):								
	slides = []								
	for i in cars[:9]:							
		slides.append({						
				"title":i["car_name"],
				"subtitle":i["car_name"] +" "+ str(i["price"])+" Lakh "+"({})".format(i["engine"]),
				"image_url":i["img"],
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


def carousalAPIView(request):
    query = request.GET.get('query',"")
    car_name = request.GET.get('car_name',"")
    price = request.GET.get('price',"")
    engine = request.GET.get('engine',"")
    data ={}
    cars = getData().get("Cardetails",[])
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
    data =  format_carousals(cars)
    return JsonResponse(data,status=200)
