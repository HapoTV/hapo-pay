from rest_framework import serializers
from .models import Child


class ChildSerializer(serializers.ModelSerializer):
    class Meta:
        model = Child
        fields = [
            "id", "first_name", "last_name", "date_of_birth",
            "avatar_url", "balance", "weekly_limit", "is_active",
        ]
        read_only_fields = ["id", "balance"]
