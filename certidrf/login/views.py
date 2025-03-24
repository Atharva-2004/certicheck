from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import User
from .serializer import UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken


@api_view(['GET'])
def get_users(request):
    users = User.objects.all()
    print("users",users)
    serializer = UserSerializer(users, many=True)
    print("serializer",serializer)
    return Response(serializer.data)

@api_view(['POST'])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED) 
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 

@api_view(['POST'])
def login(request):
    """Authenticate user and return JWT token"""
    username = request.data.get("username")
    password = request.data.get("password")

    user = User.objects.filter(username=username).first()
    
    if user and user.check_password(password):  # Validate password
        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        })
    
    return Response({"error": "Invalid Credentials"}, status=401)