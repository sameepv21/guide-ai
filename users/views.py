from django.contrib.auth import authenticate, login, logout
from django.core.cache import cache # TODO: Use Redis for production
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from users.models import User
import random
import string


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


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    if request.method == 'GET':
        user = request.user
        return Response({
            'email': user.email,
            'firstName': user.first_name,
            'lastName': user.last_name,
            'phoneNumber': user.phone_number,
            'dateJoined': user.date_joined
        })
    
    elif request.method == 'PUT':
        user = request.user
        user.first_name = request.data.get('firstName', user.first_name)
        user.last_name = request.data.get('lastName', user.last_name)
        user.phone_number = request.data.get('phoneNumber', user.phone_number)
        user.save()
        
        return Response({
            'message': 'Profile updated successfully',
            'email': user.email,
            'firstName': user.first_name,
            'lastName': user.last_name,
            'phoneNumber': user.phone_number
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_password_change(request):
    user = request.user
    
    # Generate 6-digit verification code
    code = ''.join(random.choices(string.digits, k=6))
    
    # Store in cache for 5 minutes (300 seconds)
    cache_key = f'password_reset_{user.id}'
    cache.set(cache_key, code, 300)
    
    # Send email
    send_mail(
        'Password Change Verification Code',
        f'Your verification code is: {code}\n\nThis code will expire in 5 minutes.',
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
    
    return Response({'message': 'Verification code sent to your email'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_and_change_password(request):
    user = request.user
    code = request.data.get('code')
    new_password = request.data.get('newPassword')
    
    if not code or not new_password:
        return Response({'error': 'Code and new password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check verification code from cache
    cache_key = f'password_reset_{user.id}'
    stored_code = cache.get(cache_key)
    
    if not stored_code:
        return Response({'error': 'Verification code expired or not found'}, status=status.HTTP_400_BAD_REQUEST)
    
    if stored_code != code:
        return Response({'error': 'Invalid verification code'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Change password
    user.set_password(new_password)
    user.save()
    
    # Clear the code from cache
    cache.delete(cache_key)
    
    return Response({'message': 'Password changed successfully'})
