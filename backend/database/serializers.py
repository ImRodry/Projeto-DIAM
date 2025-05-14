from typing import Any
from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.validators import UniqueValidator
from .models import Event, TicketType, Ticket


# Create your serializers here
class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=User.objects.all(), message="Username already exists."
            )
        ]
    )
    password = serializers.CharField(write_only=True, required=False)
    old_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            "username",
            "password",
            "old_password",
            "email",
            "date_joined",
            "first_name",
            "last_name",
            "is_staff",
        ]

    def create(self, validated_data: dict[str, Any]):
        validated_data.pop("old_password", None)  # Not needed on create
        return User.objects.create_user(**validated_data)

    def update(self, instance: User, validated_data: dict[str, Any]):
        password = validated_data.pop("password", None)
        old_password = validated_data.pop("old_password", None)

        if password:
            if not old_password:
                raise serializers.ValidationError(
                    {"error": "This field is required to change the password."}
                )
            if not instance.check_password(old_password):
                raise serializers.ValidationError(
                    {"error": "Old password is incorrect."}
                )
            instance.set_password(password)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class TicketTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketType
        fields = ["id", "name", "price", "quantity_available"]


class EventSerializer(serializers.ModelSerializer):
    ticket_types = TicketTypeSerializer(many=True, required=False)

    class Meta:
        model = Event
        fields = [
            "id",
            "name",
            "date",
            "description",
            "location",
            "latitude",
            "longitude",
            "ticket_types",
            "is_visible",
        ]

    def create(self, validated_data):
        ticket_types_data = validated_data.pop("ticket_types", [])
        event = Event.objects.create(**validated_data)
        for ticket_data in ticket_types_data:
            TicketType.objects.create(event=event, **ticket_data)
        return event

    def update(self, instance, validated_data):
        ticket_types_data = validated_data.pop("ticket_types", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if ticket_types_data is not None:
            instance.ticket_types.all().delete()  # simple replacement logic
            for ticket_data in ticket_types_data:
                TicketType.objects.create(event=instance, **ticket_data)

        return instance
