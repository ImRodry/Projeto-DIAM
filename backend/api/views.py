from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.core.files.storage import FileSystemStorage
from django.http import JsonResponse
from rest_framework.decorators import permission_classes
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from rest_framework import status
from backend.settings import MEDIA_ROOT

from .serializers import (
    UserSerializer,
    EventSerializer,
    TicketTypeSerializer,
    TicketSerializer,
)
from .models import Event, TicketType, Ticket


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
        raise ValidationError(serializer.errors)


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
        raise ValidationError("Invalid credentials")


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
        raise ValidationError(serializer.errors)


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
        raise ValidationError(serializer.errors)


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
        raise ValidationError(serializer.errors)

    def delete(self, request: Request, pk: int):
        event = self.get_object(pk)
        for ticket_type in event.ticket_types.all():
            if ticket_type.tickets.exists():
                raise ValidationError("Cannot delete event with sold/issued tickets.")
        event.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PurchasesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request):
        tickets = Ticket.objects.filter(user=request.user)
        serializer = TicketSerializer(tickets, many=True)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK, safe=False)

    def post(self, request: Request):
        serializer = TicketSerializer(data=request.data)
        if serializer.is_valid():
            ticket_type = serializer.validated_data["ticket_type"]
            quantity = serializer.validated_data.get("quantity")

            # Check if a ticket with the same type already exists for the user
            existing_ticket = Ticket.objects.filter(
                user=request.user, ticket_type=ticket_type
            ).first()

            if existing_ticket:
                print(f"Existing ticket found: {existing_ticket}")
                # Increase the quantity of the existing ticket
                existing_ticket.quantity += quantity
                existing_ticket.save()
                updated_serializer = TicketSerializer(existing_ticket)
                return Response(updated_serializer.data, status=status.HTTP_200_OK)
            else:
                # Create a new ticket
                serializer.save(user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        raise ValidationError(serializer.errors)


class PurchaseSingleView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request: Request, pk: int):
        try:
            ticket = Ticket.objects.get(pk=pk)
        except Ticket.DoesNotExist:
            raise ValidationError("Ticket not found.")

        if ticket.user != request.user:
            raise PermissionDenied("You do not have permission to modify this ticket.")

        rating = request.data.get("rating")
        rating_comment = request.data.get("rating_comment")

        ticket.rating = rating
        ticket.rating_comment = rating_comment
        ticket.save()

        return Response(status=status.HTTP_204_NO_CONTENT)


class UploadImageView(APIView):
    def post(self, request: Request):

        if request.FILES and request.FILES.get("image"):
            uploaded_file = request.FILES["image"]

            filename = f"upload_{uploaded_file.name}"

            fs = FileSystemStorage(location=MEDIA_ROOT)
            saved_path = fs.save(filename, uploaded_file)

            return JsonResponse({"image_path": f"/images/{saved_path}"})

        raise ValidationError("No file uploaded")
