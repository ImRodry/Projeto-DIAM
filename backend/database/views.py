from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from rest_framework import status
from .serializers import UserSerializer

# Create your views here.


class SignupView(APIView):
    def post(self, request: Request):
        serializer: UserSerializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user: User = serializer.save()
            user = authenticate(
                request, username=user.username, password=request.data.get("password")
            )
            if user is not None:
                login(request, user)
                return JsonResponse(
                    serializer.data,
                    status=status.HTTP_201_CREATED,
                )
        return JsonResponse(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class LoginView(APIView):
    def post(self, request: Request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse(
                UserSerializer(user).data,
                status=status.HTTP_200_OK,
            )
        else:
            return JsonResponse(
                {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):
    def post(self, request: Request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserView(APIView):
    @permission_classes([IsAuthenticated])
    def get(self, request: Request):
        return JsonResponse(
            UserSerializer(request.user).data, status=status.HTTP_200_OK
        )
