# core/permissions.py
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


class IsOwnAccount(permissions.BasePermission):
    """Allow access only to own account"""

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user


class IsChildOfParent(permissions.BasePermission):
    """Allow parent to access child's data"""

    def has_object_permission(self, request, view, obj):
        if request.user.role != 'parent':
            return False

        # Check if obj has child or user attribute
        child_id = getattr(obj, 'child_id', getattr(obj, 'user_id', None))
        if not child_id:
            return False

        from apps.accounts.models import StudentProfile
        try:
            student = StudentProfile.objects.get(user_id=child_id)
            return student.parent_id == request.user.id
        except StudentProfile.DoesNotExist:
            return False