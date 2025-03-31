from django.contrib import admin
from django.urls import path, include
from .views import process_document

urlpatterns = [
    path('process-document',process_document,name='process-document'),
]