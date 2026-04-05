from django.conf import settings
from rest_framework.permissions import BasePermission


class OptionalBearerSecret(BasePermission):
    """
    If COTAX_API_SECRET is unset, allow all (local dev).
    If set, require Authorization: Bearer <secret> (Next.js → Django).
    """

    def has_permission(self, request, view):
        secret = getattr(settings, "COTAX_API_SECRET", "") or ""
        if not secret:
            return True
        auth = request.headers.get("Authorization", "")
        return auth == f"Bearer {secret}"
