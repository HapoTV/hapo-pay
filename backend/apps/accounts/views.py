# apps/accounts/views.py
from rest_framework import status, viewsets, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Profile, ParentProfile, StudentProfile
from .serializers import (
    UserSerializer, ProfileSerializer, RegisterSerializer, LoginSerializer,
    ChangePasswordSerializer, ForgotPasswordSerializer, ResetPasswordSerializer,
    CompleteProfileSerializer, ParentProfileSerializer, StudentProfileSerializer
)
from core.permissions import IsParent, IsStudent, IsAdmin
from apps.wallets.models import Wallet
from apps.gamification.models import Reward
from core.supabase_client import supabase
import logging
import secrets

logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    """User registration endpoint"""
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        # All the rows that make up an account are created in one transaction.
        # Previously each create() committed on its own, so a failure partway
        # through left an orphaned User with no Profile -- and every later
        # request for that user 500'd on Profile.objects.get().
        with transaction.atomic():
            # Create user in Django
            user = User.objects.create_user(
                email=data['email'],
                password=data['password'],
                role=data['role'],
                phone_number=data.get('phone_number', '')
            )

            # Create profile
            profile = Profile.objects.create(
                user=user,
                full_name=data['full_name']
            )

            # Create role-specific profile
            if data['role'] == 'parent':
                ParentProfile.objects.create(user=user)
            elif data['role'] == 'student':
                # For student, parent_email is required but not in this serializer
                # Will be completed in complete_profile endpoint
                StudentProfile.objects.create(
                    user=user,
                    parent=None  # To be set later
                )

            # Every account needs a wallet. Nothing created one before, so the
            # first transfer/payment for a new user hit
            # Wallet.objects.get(user=...) -> Wallet.DoesNotExist -> HTTP 500.
            Wallet.objects.create(user=user)

            # Rewards row likewise: gamification reads Reward.objects.get(...)
            # on the leaderboard and reward detail endpoints.
            Reward.objects.get_or_create(user=user)

        # Create user in Supabase Auth
        try:
            supabase_user = supabase.auth.sign_up({
                "email": data['email'],
                "password": data['password'],
                "options": {
                    "data": {
                        "full_name": data['full_name'],
                        "role": data['role']
                    }
                }
            })
            user.supabase_id = supabase_user.user.id
            user.save()
        except Exception:
            # Log error but don't fail registration. Uses logger (not print) so
            # the failure actually lands in the configured log pipeline.
            logger.exception("Supabase registration failed for new user %s", user.id)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'status': 'success',
            'message': 'User registered successfully',
            'data': {
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """User login endpoint"""
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = authenticate(request, email=email, password=password)

        if not user:
            return Response({
                'status': 'error',
                'message': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({
                'status': 'error',
                'message': 'Account is deactivated'
            }, status=status.HTTP_403_FORBIDDEN)

        # Update last login
        user.last_login = timezone.now()
        user.save()

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        # Get profile data
        profile = Profile.objects.get(user=user)

        return Response({
            'status': 'success',
            'message': 'Login successful',
            'data': {
                'user': UserSerializer(user).data,
                'profile': ProfileSerializer(profile).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }
        })


class LogoutView(APIView):
    """User logout endpoint - blacklists refresh token"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()

            return Response({
                'status': 'success',
                'message': 'Logged out successfully'
            })
        except Exception:
            # str(e) leaked internal token/library details to the caller.
            logger.warning("Logout failed for user %s", request.user.id, exc_info=True)
            return Response({
                'status': 'error',
                'message': 'Invalid or expired refresh token'
            }, status=status.HTTP_400_BAD_REQUEST)


class ProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for user profiles"""
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Profile.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'update' or self.action == 'partial_update':
            return ProfileSerializer
        return ProfileSerializer

    def retrieve(self, request, *args, **kwargs):
        profile = Profile.objects.get(user=request.user)
        serializer = self.get_serializer(profile)

        # Add role-specific data
        data = serializer.data
        if request.user.role == 'parent':
            parent_profile = ParentProfile.objects.get(user=request.user)
            data['parent_profile'] = ParentProfileSerializer(parent_profile).data
        elif request.user.role == 'student':
            student_profile = StudentProfile.objects.get(user=request.user)
            data['student_profile'] = StudentProfileSerializer(student_profile).data

        return Response({
            'status': 'success',
            'data': data
        })


class ChangePasswordView(APIView):
    """Change user password"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user

        # Check old password
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({
                'status': 'error',
                'message': 'Old password is incorrect'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        # Update password in Supabase as well
        try:
            supabase.auth.update_user({
                "password": serializer.validated_data['new_password']
            })
        except Exception:
            logger.exception("Supabase password update failed for user %s", user.id)

        return Response({
            'status': 'success',
            'message': 'Password changed successfully'
        })


class ForgotPasswordView(APIView):
    """Request password reset"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)

            # Generate reset token with a CSPRNG. random.choices() uses the
            # Mersenne Twister, whose internal state is recoverable from
            # observed output, so previously issued tokens were predictable and
            # an attacker could forge a reset for any account.
            reset_token = secrets.token_urlsafe(48)

            # Store token in cache (use Redis or database)
            from django.core.cache import cache
            cache.set(f'password_reset_{reset_token}', user.id, timeout=3600)

            # Send email
            reset_link = f"https://hapopay.com/reset-password?token={reset_token}"
            try:
                send_mail(
                    'Password Reset Request - HapoPay',
                    f'Click the link to reset your password: {reset_link}\n\nThis link expires in 1 hour.',
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
            except Exception:
                # A mail-server failure must not change the response, or the
                # differing status code re-introduces user enumeration.
                logger.exception("Failed to send password reset email")

        except User.DoesNotExist:
            # Fall through to the shared response below. The two branches
            # previously returned *different* messages ("Password reset email
            # sent" vs "If an account exists..."), which let an attacker
            # enumerate registered email addresses.
            logger.info("Password reset requested for unregistered address")

        return Response({
            'status': 'success',
            'message': 'If an account exists, a reset email has been sent'
        })


class ResetPasswordView(APIView):
    """Reset password with token"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        from django.core.cache import cache
        user_id = cache.get(f'password_reset_{token}')

        if not user_id:
            return Response({
                'status': 'error',
                'message': 'Invalid or expired token'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=user_id)
            user.set_password(new_password)
            user.save()

            # Delete token
            cache.delete(f'password_reset_{token}')

            return Response({
                'status': 'success',
                'message': 'Password reset successfully'
            })
        except User.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)


class CompleteProfileView(APIView):
    """Complete profile after registration"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CompleteProfileSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        data = serializer.validated_data

        if user.role == 'parent':
            parent_profile = ParentProfile.objects.get(user=user)
            parent_profile.occupation = data.get('occupation', parent_profile.occupation)
            parent_profile.default_currency = data.get('default_currency', parent_profile.default_currency)
            parent_profile.save()

        elif user.role == 'student':
            student_profile = StudentProfile.objects.get(user=user)

            # Link to parent
            if 'parent_email' in data:
                try:
                    parent = User.objects.get(email=data['parent_email'], role='parent')
                    student_profile.parent = parent
                except User.DoesNotExist:
                    return Response({
                        'status': 'error',
                        'message': 'Parent not found'
                    }, status=status.HTTP_404_NOT_FOUND)

            student_profile.school_name = data.get('school_name', student_profile.school_name)
            student_profile.grade = data.get('grade', student_profile.grade)
            student_profile.weekly_allowance = data.get('weekly_allowance', student_profile.weekly_allowance)
            student_profile.savings_goal = data.get('savings_goal', student_profile.savings_goal)
            student_profile.save()

        return Response({
            'status': 'success',
            'message': 'Profile completed successfully'
        })


class RoleSwitchView(APIView):
    """Switch between roles the user has actually been provisioned for.

    Security: this endpoint previously wrote `request.data['role']` straight
    onto the user, with 'admin' among the accepted values. Because every
    authorization check in the codebase is `request.user.role == '<x>'`
    (core/permissions.py), any authenticated student could POST
    {"role": "admin"} and gain the full admin panel -- user management, system
    config, audit logs and fraud alerts. A role may now only be assumed if the
    matching profile row exists, and 'admin' can never be self-assigned; admin
    is granted only by an existing admin through UserManagementView.
    """
    permission_classes = [IsAuthenticated]

    # 'admin' is deliberately absent: it is never self-assignable.
    SWITCHABLE_ROLES = {
        'parent': 'parent_profile',
        'student': 'student_profile',
    }

    def post(self, request):
        role = request.data.get('role')

        if role not in self.SWITCHABLE_ROLES:
            return Response({
                'status': 'error',
                'message': 'Invalid role'
            }, status=status.HTTP_400_BAD_REQUEST)

        # The user must already own the profile for the role being assumed.
        if getattr(request.user, self.SWITCHABLE_ROLES[role], None) is None:
            logger.warning(
                "Rejected role switch to %s for user %s: no %s provisioned",
                role, request.user.id, self.SWITCHABLE_ROLES[role],
            )
            return Response({
                'status': 'error',
                'message': 'You are not provisioned for this role'
            }, status=status.HTTP_403_FORBIDDEN)

        request.user.role = role
        request.user.save(update_fields=['role', 'updated_at'])

        logger.info("User %s switched role to %s", request.user.id, role)

        return Response({
            'status': 'success',
            'message': f'Switched to {role} role',
            'data': {
                'role': role
            }
        })