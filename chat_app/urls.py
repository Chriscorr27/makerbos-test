
from .views import *
from django.urls import path

urlpatterns = [
    path('go_to/',go_toAPIView,name="got_to"),
    path('carousel/',carousalAPIView,name="carousel"),
    path('video/',videoAPIView,name="video"),
    path('button/',buttonAPIView,name="button"),
    path('send_message/',sendmessageAPIView,name="send message"),
    path('car-brand/',carBrandsAPIView,name="car_brand"),
]
