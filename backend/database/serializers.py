from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.validators import UniqueValidator


# Create your serializers here
class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=User.objects.all(), message="Username already exists."
            )
        ]
    )
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "password",
            "email",
            "date_joined",
            "first_name",
            "last_name",
            "is_staff",
        ]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
