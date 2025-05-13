from rest_framework import serializers
from django.contrib.auth.models import User


# Create your serializers here
class UserSerializer(serializers.Serializer):
    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "date_joined",
            "first_name",
            "last_name",
            "is_staff",
        ]
