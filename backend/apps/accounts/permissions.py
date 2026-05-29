# apps/accounts/permissions.py
from rest_framework import permissions


class IsParent(permissions.BasePermission):
    """Allow access only to parent users"""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'parent'

    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and request.user.role == 'parent'


class IsStudent(permissions.BasePermission):
    """Allow access only to student users"""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'student'

    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and request.user.role == 'student'


class IsAdmin(permissions.BasePermission):
    """Allow access only to admin users"""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and request.user.role == 'admin'