
from .views import *
from django.urls import path

urlpatterns = [
    path('',metaProxy,name="meta_proxy"),
]
