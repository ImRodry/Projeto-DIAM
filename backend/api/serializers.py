from rest_framework import serializers
from django.contrib.auth.models import User, Group
from rest_framework.validators import UniqueValidator
from .models import Event, TicketType, Ticket


class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=User.objects.all(), message="O Username já existe."
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
            "groups",
        ]

    def create(self, validated_data: dict):
        validated_data.pop("old_password", None)  # Not needed on create
        groups = validated_data.pop("groups", [1])
        user = User.objects.create_user(**validated_data)
        user.groups.set(groups)
        return user

    def update(self, instance: User, validated_data: dict):
        password = validated_data.pop("password", None)
        old_password = validated_data.pop("old_password", None)
        groups = validated_data.pop("groups", None)

        if password:
            if not old_password:
                raise serializers.ValidationError(
                    {"error": "Este campo é obrigatório para mudar de password."}
                )
            if not instance.check_password(old_password):
                raise serializers.ValidationError(
                    {"error": "Password Antinga está incorreta."}
                )
            instance.set_password(password)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.groups.set(groups) if groups else None
        instance.save()
        return instance


class EventSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ["id", "name", "date", "location"]


class TicketRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ["rating", "rating_comment"]


class TicketTypeSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False, default=None)
    event = EventSummarySerializer(read_only=True)
    tickets = TicketRatingSerializer(many=True, read_only=True)
    groups = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(),
        many=True,
    )

    class Meta:
        model = TicketType
        fields = [
            "id",
            "name",
            "price",
            "quantity_available",
            "event",
            "tickets",
            "groups",
        ]


class EventSerializer(serializers.ModelSerializer):
    ticket_types = TicketTypeSerializer(many=True, required=False)
    image = serializers.CharField(required=False, allow_null=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "name",
            "image",
            "date",
            "description",
            "location",
            "latitude",
            "longitude",
            "ticket_types",
            "is_visible",
        ]

    def create(self, validated_data: dict):
        ticket_types_data = validated_data.pop("ticket_types", [])
        event = Event.objects.create(**validated_data)
        for ticket_data in ticket_types_data:
            groups = ticket_data.pop("groups", [])
            ticket = TicketType.objects.create(event=event, **ticket_data)
            ticket.groups.set(groups)
        return event

    def update(self, instance, validated_data: dict):
        ticket_types_data = validated_data.pop("ticket_types", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if ticket_types_data is not None:
            sent_ids = []
            for ticket_data in ticket_types_data:
                groups = ticket_data.pop("groups", [])
                ticket_id = ticket_data.get("id", None)
                if ticket_id:
                    try:
                        ticket_type = instance.ticket_types.get(id=ticket_id)
                        for attr, value in ticket_data.items():
                            if attr != "id":
                                setattr(ticket_type, attr, value)
                        ticket_type.save()
                        ticket_type.groups.set(groups)
                        sent_ids.append(ticket_id)
                    except TicketType.DoesNotExist:
                        new_ticket = TicketType.objects.create(
                            event=instance, **ticket_data
                        )
                        new_ticket.groups.set(groups)
                else:
                    new_ticket = TicketType.objects.create(
                        event=instance, **ticket_data
                    )
                    new_ticket.groups.set(groups)
                    sent_ids.append(new_ticket.id)

            # Delete ticket types not included in the update
            instance.ticket_types.exclude(id__in=sent_ids).delete()

        return instance


class TicketSerializer(serializers.ModelSerializer):
    ticket_type = TicketTypeSerializer(read_only=True)
    ticket_type_id = serializers.PrimaryKeyRelatedField(
        queryset=TicketType.objects.all(), source="ticket_type", write_only=True
    )

    class Meta:
        model = Ticket
        fields = [
            "id",
            "ticket_type",
            "ticket_type_id",
            "purchase_date",
            "quantity",
            "rating",
            "rating_comment",
        ]
        read_only_fields = ["id", "user", "purchase_date"]

    def validate(self, data: dict):
        ticket_type: TicketType = data.get("ticket_type")
        quantity: int = data.get("quantity")

        if ticket_type and quantity:
            tickets_sold = sum(t.quantity for t in ticket_type.tickets.all())
            remaining = ticket_type.quantity_available - tickets_sold

            if quantity > remaining:
                raise serializers.ValidationError(
                    f"Sobram apenas {remaining} bilhetes deste tipo para compra."
                )

        return data
