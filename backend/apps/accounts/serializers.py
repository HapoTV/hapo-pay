# apps/accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.validators import EmailValidator
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User, Profile, ParentProfile, StudentProfile, AdminProfile
import logging

logger = logging.getLogger(__name__)


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the custom User model.

    Used to expose safe, read-only user fields in API responses.
    Never exposes the password field.
    """

    class Meta:
        model = User
        fields = ('id', 'email', 'phone_number', 'role', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')


class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the shared Profile model.

    Handles basic personal information common to all user roles
    (parents, students, admins).
    """

    class Meta:
        model = Profile
        fields = ('id', 'full_name', 'avatar_url', 'date_of_birth', 'address', 'city', 'country')
        read_only_fields = ('id',)


class ParentProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the ParentProfile model.

    Contains parent-specific fields such as occupation, notification
    preferences and verification status. Verification is controlled
    by admins, so it is read-only here.
    """

    class Meta:
        model = ParentProfile
        fields = ('occupation', 'notification_preferences', 'is_verified', 'default_currency')
        read_only_fields = ('is_verified',)


class StudentProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the StudentProfile model.

    Contains student-specific fields such as school name, grade,
    allowance and savings goal. Account freeze status is read-only
    because it can only be changed by the parent through dedicated endpoints.
    """

    class Meta:
        model = StudentProfile
        fields = ('school_name', 'grade', 'weekly_allowance', 'savings_goal', 'is_account_frozen')
        read_only_fields = ('is_account_frozen',)


class RegisterSerializer(serializers.Serializer):
    """
    Serializer used for new user registration.

    Validates that:
    - The email is a valid email address
    - The password meets Django password validation rules
    - Password and confirm_password match
    - No existing user with the same email exists

    On success, the view creates a User, Profile and role-specific profile.
    """
    email = serializers.EmailField(validators=[EmailValidator()])
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(max_length=255)
    role = serializers.ChoiceField(choices=['parent', 'student'])
    phone_number = serializers.CharField(max_length=15, required=False)

    def validate(self, data):
        """
        Cross-field validation for registration.

        Ensures passwords match and no duplicate email exists.
        Catches unexpected errors so the API returns a clean validation
        error instead of a 500 response.
        """
        try:
            if data['password'] != data['confirm_password']:
                raise serializers.ValidationError({"confirm_password": "Passwords do not match"})

            if User.objects.filter(email=data['email']).exists():
                raise serializers.ValidationError({"email": "User with this email already exists"})

            return data
        except serializers.ValidationError:
            # Re-raise validation errors as-is (expected flow)
            raise
        except Exception as e:
            # Log unexpected errors and convert to a validation error
            logger.error(f"Unexpected error during registration validation: {str(e)}")
            raise serializers.ValidationError({"detail": "An unexpected error occurred during validation."})


class LoginSerializer(serializers.Serializer):
    """
    Serializer used for user login.

    Only validates the presence of email and password. Actual
    authentication is performed by Django's authenticate() function
    inside the LoginView.
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing a user's password.

    Requires:
    - old_password: current password
    - new_password: new password that passes Django validators
    - confirm_password: must match new_password

    The view is responsible for verifying old_password.
    """
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        """
        Ensure new_password and confirm_password match.
        """
        try:
            if data['new_password'] != data['confirm_password']:
                raise serializers.ValidationError({"confirm_password": "Passwords do not match"})
            return data
        except serializers.ValidationError:
            raise
        except Exception as e:
            logger.error(f"Unexpected error during password change validation: {str(e)}")
            raise serializers.ValidationError({"detail": "An unexpected error occurred during validation."})


class ForgotPasswordSerializer(serializers.Serializer):
    """
    Serializer for requesting a password reset email.

    Only requires the user's email. The view decides whether to send
    the reset link (it deliberately does not reveal whether the email
    exists in the system, for security).
    """
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    """
    Serializer for resetting a password using a token.

    The token is validated in the view against the cache. This serializer
    only checks that new_password and confirm_password match and that the
    new password passes Django validators.
    """
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        """
        Ensure new_password and confirm_password match.
        """
        try:
            if data['new_password'] != data['confirm_password']:
                raise serializers.ValidationError({"confirm_password": "Passwords do not match"})
            return data
        except serializers.ValidationError:
            raise
        except Exception as e:
            logger.error(f"Unexpected error during password reset validation: {str(e)}")
            raise serializers.ValidationError({"detail": "An unexpected error occurred during validation."})


class CompleteProfileSerializer(serializers.Serializer):
    """
    Serializer for completing a user profile after registration.

    Contains optional fields for both parent and student roles.
    The view uses only the fields relevant to the requesting user's role.
    """
    # Parent fields
    occupation = serializers.CharField(max_length=200, required=False)
    default_currency = serializers.CharField(max_length=3, required=False, default='ZAR')

    # Student fields
    parent_email = serializers.EmailField(required=False)
    school_name = serializers.CharField(max_length=200, required=False)
    grade = serializers.IntegerField(required=False, min_value=1, max_value=12)
    weekly_allowance = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    savings_goal = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)