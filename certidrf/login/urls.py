from django.urls import path, include
from .views import get_users, register, login

urlpatterns = [
    path('get_users',get_users, name='get_users'),
    path('register', register, name='register'),
    path('login',login,name='login')
]