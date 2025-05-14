from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from rest_framework import status, generics
from .serializers import (
    UserSerializer,
    EventSerializer,
    TicketTypeSerializer,
    TicketSerializer,
)
from .models import Event, TicketType, Ticket

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


@permission_classes([IsAuthenticated])
class UserView(APIView):
    def get(self, request: Request):
        return JsonResponse(
            UserSerializer(request.user).data, status=status.HTTP_200_OK
        )

    def patch(self, request: Request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EventMultipleView(APIView):
    def get(self, request: Request):
        if request.user.is_staff:
            events = Event.objects.all()
        else:
            events = Event.objects.filter(is_visible=True)
        serializer = EventSerializer(events, many=True)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK, safe=False)

    def post(self, request: Request):
        serializer = EventSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(
                serializer.data, status=status.HTTP_201_CREATED, safe=False
            )
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EventSingleView(APIView):
    def get_object(self, pk: int):
        try:
            return Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            raise ValidationError("Event not found.")

    def get(self, request: Request, pk):
        event = self.get_object(pk)
        serializer = EventSerializer(event)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK, safe=False)

    def patch(self, request: Request, pk: int):
        event = self.get_object(pk)
        serializer = EventSerializer(event, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_200_OK, safe=False)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request: Request, pk: int):
        event = self.get_object(pk)
        for ticket_type in event.ticket_types.all():
            if (
                ticket_type.tickets.exists()
            ):  # If there are tickets related to the TicketType
                raise ValidationError("Cannot delete event with sold/issued tickets.")
        event.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TicketTypeMultipleView(APIView):
    def get(self, request: Request, event_id: int):
        event = Event.objects.get(pk=event_id)
        ticket_types = event.ticket_types.all()
        serializer = TicketTypeSerializer(ticket_types, many=True)
        # se isto der erro é porque falta o safe=False
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)

    def post(self, request: Request, event_id):
        event = Event.objects.get(pk=event_id)
        serializer = TicketTypeSerializer(data=request.data)
        if serializer.is_valid():
            ticket_type = serializer.save(event=event)
            return JsonResponse(
                TicketTypeSerializer(ticket_type).data, status=status.HTTP_201_CREATED
            )
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TicketTypeSingleView(APIView):
    def get_object(self, pk: int):
        try:
            return TicketType.objects.get(pk=pk)
        except TicketType.DoesNotExist:
            raise ValidationError("TicketType not found.")

    def get(self, request: Request, event_id: int, pk: int):
        ticket_type = self.get_object(pk)
        serializer = TicketTypeSerializer(ticket_type)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request: Request, event_id: int, pk: int):
        ticket_type = self.get_object(pk)
        serializer = TicketTypeSerializer(ticket_type, data=request.data, partial=True)
        if serializer.is_valid():
            ticket_type = serializer.save()
            return JsonResponse(
                TicketTypeSerializer(ticket_type).data, status=status.HTTP_200_OK
            )
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request: Request, event_id: int, pk: int):
        ticket_type = self.get_object(pk)
        ticket_type.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PurchasesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tickets = Ticket.objects.filter(user=request.user)
        serializer = TicketSerializer(tickets, many=True)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = TicketSerializer(data=request.data)
        if serializer.is_valid():
            ticket = Ticket.objects.create(
                user=request.user,
                ticket_type=serializer.validated_data["ticket_type"],
                quantity=serializer.validated_data["quantity"],
            )
            return Response(
                TicketSerializer(ticket).data, status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
