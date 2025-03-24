from django.urls import path, include
from .views import get_users, register, login

urlpatterns = [
    path('get_users',get_users),
    path('register', register),
    path('login',login)
]