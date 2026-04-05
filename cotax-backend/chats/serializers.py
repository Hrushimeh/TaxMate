from rest_framework import serializers

from .models import Chat


class ChatListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ("id", "title", "created_at", "updated_at")


class ChatDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ("id", "title", "messages", "created_at", "updated_at")


class ChatUpsertSerializer(serializers.Serializer):
    title = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, max_length=500
    )
    messages = serializers.JSONField()

    def validate_messages(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("messages must be a list")
        return value
