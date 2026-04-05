import uuid

from django.db import models


class Chat(models.Model):
    """Persisted AI chat thread (messages stored as JSON for the Next.js / Vercel AI UI format)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    title = models.CharField(max_length=500, null=True, blank=True)
    messages = models.JSONField(default=list)

    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["-updated_at"], name="chats_updated_at_desc"),
        ]

    def __str__(self) -> str:
        return self.title or str(self.id)
