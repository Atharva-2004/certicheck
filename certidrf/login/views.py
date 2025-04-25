from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializer import CustomTokenObtainPairSerializer, UserSerializer  # Import your custom serializer

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_details(request):
    """Return the authenticated user's details."""
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "role": user.role,  # Assuming the User model has a `role` field
        "firstname": user.firstname,  # Assuming the User model has a `firstname` field
        "email": user.email
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_users(request):
    """Return list of users (restricted to authenticated users only)."""
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response({'all_users': serializer.data, 'current_user': request.user.username, 'current_user_role': request.user.role, 'firstname': request.user.firstname})

@api_view(['POST'])
def register(request):
    """Register a new user"""
    print("Registration data received:", request.data)  # Debug print
    
    # Check if email is verified for applicants
    if request.data.get('role') == 'applicant':
        email = request.data.get('email')
        cache_key = f'email_verified_{email}'
        is_verified = cache.get(cache_key)
        
        if not is_verified:
            return Response({
                "error": "Email verification required",
                "detail": "Please verify your email before registration"
            }, status=status.HTTP_400_BAD_REQUEST)

    serializer = UserSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            user = serializer.save()
            return Response({
                "message": "User registered successfully",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "role": user.role,
                    "email": user.email
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print("Registration error:", str(e))  # Debug print
            return Response({
                "error": "Registration failed",
                "detail": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    print("Validation errors:", serializer.errors)  # Debug print
    return Response({
        "error": "Invalid registration data",
        "details": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT login view."""
    serializer_class = CustomTokenObtainPairSerializer
    
    
from django.core.cache import cache
from django.conf import settings
from django.core.mail import send_mail
import random
import string

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

@api_view(['POST'])
def send_verification_email(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required'}, status=400)
    
    otp = generate_otp()
    # Store OTP in cache with expiry
    cache_key = f'email_otp_{email}'
    cache.set(cache_key, otp, timeout=settings.OTP_EXPIRY_TIME)
    
    print(f"Stored OTP in cache: {otp} for email: {email}")
    print(f"Cache key: {cache_key}")
    
    try:
        send_mail(
            'Email Verification - CertiCheck',
            f'Your verification code is: {otp}\nThis code will expire in 5 minutes.',
            'atharva7ajagekar@gmail.com',
            [email],
            fail_silently=False,
        )
        return Response({
            'message': 'OTP sent successfully',
            'debug_otp': otp  # Remove in production
        })
    except Exception as e:
        print(f"Email sending error: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def verify_otp(request):
    email = request.data.get('email')
    submitted_otp = request.data.get('otp')
    
    if not email or not submitted_otp:
        return Response({
            'error': 'Email and OTP are required'
        }, status=400)
    
    cache_key = f'email_otp_{email}'
    stored_otp = cache.get(cache_key)
    
    # Debug prints
    print(f"Submitted OTP: {submitted_otp}")
    print(f"Stored OTP: {stored_otp}")
    
    if not stored_otp:
        return Response({
            'error': 'OTP expired or invalid'
        }, status=400)
    
    if str(stored_otp) != str(submitted_otp):
        return Response({
            'error': 'Invalid OTP'
        }, status=400)
    
    # Clear the OTP and set verification flag
    cache.delete(cache_key)
    verification_key = f'email_verified_{email}'
    cache.set(verification_key, True, timeout=300)  # 5 minutes to complete registration
    
    return Response({
        'message': 'Email verified successfully'
    })