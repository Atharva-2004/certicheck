from django.urls import path, include
from .views import get_users, register, get_user_details,verify_otp, send_verification_email
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('get_users',get_users, name='get_users'),
    path('register', register, name='register'),
    path('login',TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path('user',get_user_details, name='get_user_details'),
    path('send-verification-email', send_verification_email, name='send_verification_email'),
    path('verify-otp',verify_otp, name='verify_otp'),
]
