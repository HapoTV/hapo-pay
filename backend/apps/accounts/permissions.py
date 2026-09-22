# apps/accounts/permissions.py
from rest_framework import permissions


class IsParent(permissions.BasePermission):
    """
    Permission class that allows access only to users with the 'parent' role.

    has_permission: applies to the whole view (used for list/create endpoints).
    has_object_permission: applies to individual objects (used for detail endpoints).
    """

    def has_permission(self, request, view):
        """
        Return True if the request user is authenticated and has role 'parent'.
        Wrapped in try-except to safely handle unusual request objects.
        """
        try:
            return bool(
                request.user
                and request.user.is_authenticated
                and request.user.role == 'parent'
            )
        except Exception:
            return False

    def has_object_permission(self, request, view, obj):
        """
        Return True if the request user is a parent (object-level check is
        usually enforced in the queryset or view logic for ownership).
        """
        try:
            return bool(
                request.user
                and request.user.is_authenticated
                and request.user.role == 'parent'
            )
        except Exception:
            return False


class IsStudent(permissions.BasePermission):
    """
    Permission class that allows access only to users with the 'student' role.
    """

    def has_permission(self, request, view):
        """
        Return True if the request user is authenticated and has role 'student'.
        """
        try:
            return bool(
                request.user
                and request.user.is_authenticated
                and request.user.role == 'student'
            )
        except Exception:
            return False

    def has_object_permission(self, request, view, obj):
        """
        Return True if the request user is a student.
        """
        try:
            return bool(
                request.user
                and request.user.is_authenticated
                and request.user.role == 'student'
            )
        except Exception:
            return False


class IsAdmin(permissions.BasePermission):
    """
    Permission class that allows access only to users with the 'admin' role.

    Note: This is separate from Django's is_staff/is_superuser flags.
    A user with role='admin' is expected to have elevated privileges.
    """

    def has_permission(self, request, view):
        """
        Return True if the request user is authenticated and has role 'admin'.
        """
        try:
            return bool(
                request.user
                and request.user.is_authenticated
                and request.user.role == 'admin'
            )
        except Exception:
            return False

    def has_object_permission(self, request, view, obj):
        """
        Return True if the request user is an admin.
        """
        try:
            return bool(
                request.user
                and request.user.is_authenticated
                and request.user.role == 'admin'
            )
        except Exception:
            return False