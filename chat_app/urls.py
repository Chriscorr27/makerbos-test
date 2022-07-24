
from .views import *
from django.urls import path

urlpatterns = [
    path('carousal/',carousalAPIView,name="carousal"),
    path('video/',videoAPIView,name="video"),
    path('button/',buttonAPIView,name="button"),
    path('send_message/',sendmessageAPIView,name="send message"),
    path('attribute/',attributeAPIView,name="attribute"),
]
