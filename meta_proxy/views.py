from django.shortcuts import render
from urllib.parse import urlparse
from django.http import JsonResponse
from  rest_framework.decorators import *
import metadata_parser

@api_view(["GET"])
def metaProxy(request):
    url = request.GET["url"]
    page = metadata_parser.MetadataParser(url,search_head_only=True)
    metaJson = {
    "description": "",
    "image": "",
    "title": "",
    "url": url,
    "domain":getDomain(url)
    }
    # print(page.metadata)
    if page.metadata.get("og",{}).get("image"):
        image_url = page.metadata.get("og",{}).get("image")
        if is_url(image_url):
            metaJson["image"]=page.metadata.get("og",{}).get("image")
        else:
            metaJson["image"]=page.metadata.get("og",{}).get("url","")+page.metadata.get("og",{}).get("image")
    if page.metadata.get("og",{}).get("title"):
        metaJson["title"]=page.metadata.get("og",{}).get("title")
    if page.metadata.get("page",{}).get("title"):
        metaJson["title"]=page.metadata.get("page",{}).get("title")
    if page.metadata.get("og",{}).get("description"):
        metaJson["description"]=page.metadata.get("og",{}).get("description")
    if page.metadata.get("meta",{}).get("description"):
        metaJson["description"]=page.metadata.get("meta",{}).get("description")
    return JsonResponse(metaJson,status=200)



def is_url(url):
  try:
    result = urlparse(url)
    return all([result.scheme, result.netloc])
  except ValueError:
    return False

def getDomain(url):
    domain = urlparse(url).netloc
    return domain