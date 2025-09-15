from django.contrib.auth import authenticate, login, logout
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from users.models import User


@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('firstName', '')
    last_name = request.data.get('lastName', '')
    phone_number = request.data.get('phoneNumber', '')
    
    # Check if user already exists
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    User.objects.create_user(
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        phone_number=phone_number
    )
    
    return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    # Check if user exists
    user_exists = User.objects.filter(email=email).exists()
    
    if not user_exists:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Try to authenticate
    user = authenticate(request, email=email, password=password)
    
    if not user:
        return Response({'error': 'Incorrect password'}, status=status.HTTP_401_UNAUTHORIZED)
    
    login(request, user)
    
    return Response({
        'message': 'Login successful',
        'user': {
            'email': user.email,
            'firstName': user.first_name,
            'lastName': user.last_name
        }
    })


@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logout successful'})
