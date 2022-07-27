
from .views import *
from django.urls import path

urlpatterns = [
    path('go_to/',go_toAPIView,name="got_to"),
    path('carousel/',carousalAPIView,name="carousel"),
    path('video/',videoAPIView,name="video"),
    path('button/',buttonAPIView,name="button"),
    path('send_message/',sendmessageAPIView,name="send message"),
    path('car-brand/',carBrandsAPIView,name="car_brand"),
    path('car-list/',carListAPIView,name="car_list"),
    path('car-deatil/',carDetailAPIView,name="car_detail"),
    path('collect_data/',collectCars,name="collect_data"),
]
