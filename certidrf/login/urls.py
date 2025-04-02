from django.urls import path, include
from .views import get_users, register
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('get_users',get_users, name='get_users'),
    path('register', register, name='register'),
    path('login',TokenObtainPairView.as_view(), name="token_obtain_pair")
]