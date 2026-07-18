# apps/accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.validators import EmailValidator
from .models import User, Profile, ParentProfile, StudentProfile, AdminProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'phone_number', 'role', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('id', 'full_name', 'avatar_url', 'date_of_birth', 'address', 'city', 'country')
        read_only_fields = ('id',)


class ParentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParentProfile
        fields = ('occupation', 'notification_preferences', 'is_verified', 'default_currency')
        read_only_fields = ('is_verified',)


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ('school_name', 'grade', 'weekly_allowance', 'savings_goal', 'is_account_frozen')
        read_only_fields = ('is_account_frozen',)


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(validators=[EmailValidator()])
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(max_length=255)
    role = serializers.ChoiceField(choices=['parent', 'student', 'merchant'])
    phone_number = serializers.CharField(max_length=15, required=False)

    # Required only when role='merchant' — Merchant.business_registration is
    # a required, unique field, so it can't be filled in with a placeholder
    # and completed later the way StudentProfile.parent is.
    business_registration = serializers.CharField(max_length=100, required=False)
    business_category = serializers.ChoiceField(
        choices=['retail', 'restaurant', 'transport', 'entertainment', 'education', 'healthcare', 'airtime', 'other'],
        required=False
    )
    business_address = serializers.CharField(required=False)

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})

        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "User with this email already exists"})

        if data['role'] == 'merchant':
            missing = [
                field for field in ('business_registration', 'business_category', 'business_address')
                if not data.get(field)
            ]
            if missing:
                raise serializers.ValidationError({
                    field: 'This field is required when registering as a merchant.' for field in missing
                })
            from apps.payments.models import Merchant
            if Merchant.objects.filter(business_registration=data['business_registration']).exists():
                raise serializers.ValidationError({
                    'business_registration': 'A merchant with this registration number already exists.'
                })

        return data


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})
        return data


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})
        return data


class CompleteProfileSerializer(serializers.Serializer):
    # Parent fields
    occupation = serializers.CharField(max_length=200, required=False)
    default_currency = serializers.CharField(max_length=3, required=False, default='ZAR')

    # Student fields
    parent_email = serializers.EmailField(required=False)
    school_name = serializers.CharField(max_length=200, required=False)
    grade = serializers.IntegerField(required=False, min_value=1, max_value=12)
    weekly_allowance = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    savings_goal = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)