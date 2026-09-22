# apps/accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Profile, ParentProfile, StudentProfile, AdminProfile


class CustomUserAdmin(UserAdmin):
    """
    Custom admin configuration for the User model.

    Extends Django's default UserAdmin to show role and phone number
    fields, and to use email as the primary identifier in the admin list.
    """
    list_display = ('email', 'role', 'is_active', 'created_at')
    list_filter = ('role', 'is_active', 'created_at')
    search_fields = ('email', 'phone_number')
    ordering = ('-created_at',)

    # Form layout when editing an existing user
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('phone_number', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )

    # Form layout when creating a new user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role'),
        }),
    )


class ProfileAdmin(admin.ModelAdmin):
    """
    Admin configuration for the shared Profile model.

    Displays the user's role in the list view for easier navigation.
    """
    list_display = ('user', 'full_name', 'get_role')
    search_fields = ('full_name', 'user__email')

    def get_role(self, obj):
        """
        Returns the role of the profile's user for display in the admin list.
        Wrapped in try-except to avoid admin crashes if a user is missing.
        """
        try:
            return obj.user.role
        except Exception:
            return '-'

    get_role.short_description = 'Role'


# Register all account-related models with their custom admin classes
admin.site.register(User, CustomUserAdmin)
admin.site.register(Profile, ProfileAdmin)
admin.site.register(ParentProfile)
admin.site.register(StudentProfile)
admin.site.register(AdminProfile)