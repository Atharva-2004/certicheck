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
    serializer = UserSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "User registered successfully"}, 
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT login view."""
    serializer_class = CustomTokenObtainPairSerializer
