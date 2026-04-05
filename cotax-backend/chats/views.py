import uuid

from rest_framework import status, viewsets
from rest_framework.response import Response

from .models import Chat
from .serializers import ChatDetailSerializer, ChatListSerializer, ChatUpsertSerializer


class ChatViewSet(viewsets.GenericViewSet):
    """
    Chat history API consumed by the Next.js app (server-side proxy).

    - GET /api/chats/ — list recent chats (metadata only)
    - GET /api/chats/<uuid>/ — full thread
    - PUT /api/chats/<uuid>/ — create or replace messages (upsert)
    - DELETE /api/chats/<uuid>/ — remove chat
    """

    lookup_field = "pk"
    http_method_names = ["get", "put", "delete", "head", "options"]

    def get_queryset(self):
        return Chat.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = Chat.objects.order_by("-updated_at")[:100]
        return Response(ChatListSerializer(queryset, many=True).data)

    def retrieve(self, request, *args, **kwargs):
        try:
            uuid.UUID(str(kwargs["pk"]))
        except ValueError:
            return Response({"detail": "Invalid chat id"}, status=status.HTTP_400_BAD_REQUEST)
        chat = self.get_queryset().filter(pk=kwargs["pk"]).first()
        if chat is None:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(ChatDetailSerializer(chat).data)

    def update(self, request, *args, **kwargs):
        try:
            pk = uuid.UUID(str(kwargs["pk"]))
        except ValueError:
            return Response({"detail": "Invalid chat id"}, status=status.HTTP_400_BAD_REQUEST)

        ser = ChatUpsertSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        messages = ser.validated_data["messages"]
        incoming_title = ser.validated_data.get("title")

        chat = Chat.objects.filter(pk=pk).first()
        if chat is None:
            chat = Chat.objects.create(
                id=pk,
                title=incoming_title,
                messages=messages,
            )
            return Response(
                ChatDetailSerializer(chat).data,
                status=status.HTTP_201_CREATED,
            )

        chat.messages = messages
        if incoming_title and not chat.title:
            chat.title = incoming_title
        chat.save()
        return Response(ChatDetailSerializer(chat).data)

    def destroy(self, request, *args, **kwargs):
        try:
            pk = uuid.UUID(str(kwargs["pk"]))
        except ValueError:
            return Response({"detail": "Invalid chat id"}, status=status.HTTP_400_BAD_REQUEST)

        deleted, _ = Chat.objects.filter(pk=pk).delete()
        if deleted == 0:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
