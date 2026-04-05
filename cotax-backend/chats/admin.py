from django.contrib import admin

from .models import Chat


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "updated_at", "created_at")
    list_filter = ("created_at",)
    search_fields = ("title", "id")
    readonly_fields = ("id", "created_at", "updated_at")
