from django.contrib.auth.models import User
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


# Create your models here.
class Event(models.Model):
    name = models.TextField()
    image = models.TextField(null=True)
    date = models.DateTimeField()
    description = models.TextField()
    location = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    is_visible = models.BooleanField(default=False)


class TicketType(models.Model):
    event = models.ForeignKey(
        Event, on_delete=models.CASCADE, related_name="ticket_types"
    )
    name = models.TextField()
    price = models.DecimalField(max_digits=4, decimal_places=2)
    quantity_available = models.PositiveSmallIntegerField()


class Ticket(models.Model):
    ticket_type = models.ForeignKey(
        TicketType, on_delete=models.RESTRICT, related_name="tickets"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tickets")
    purchase_date = models.DateTimeField(auto_now_add=True)
    quantity = models.PositiveSmallIntegerField()
    rating = models.PositiveSmallIntegerField(
        null=True, validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    rating_comment = models.TextField(null=True)
