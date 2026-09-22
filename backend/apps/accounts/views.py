# apps/accounts/views.py
"""
Accounts Views Module
=====================
This module contains all authentication and user management endpoints.

Endpoints Overview:
- RegisterView: User registration
- LoginView: User authentication
- LogoutView: Token blacklisting
- ProfileViewSet: Profile CRUD operations
- ChangePasswordView: Password change for authenticated users
- ForgotPasswordView: Password reset request
- ResetPasswordView: Password reset with token
- CompleteProfileView: Post-registration profile completion
- RoleSwitchView: Role switching for multi-role users

All views follow consistent error handling patterns with try-catch blocks.
Responses use the standard format:
{
    'status': 'success' | 'error',
    'message': 'Human-readable message',
    'data': {...} | None,
    'errors': {...} | None
}
"""

from rest_framework import status, viewsets, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.core.cache import cache
from .models import User, Profile, ParentProfile, StudentProfile
from .serializers import (
    UserSerializer, ProfileSerializer, RegisterSerializer, LoginSerializer,
    ChangePasswordSerializer, ForgotPasswordSerializer, ResetPasswordSerializer,
    CompleteProfileSerializer, ParentProfileSerializer, StudentProfileSerializer
)
from core.permissions import IsParent, IsStudent, IsAdmin
from core.supabase_client import supabase
import random
import string
import logging

# Module-level logger for tracking errors
logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    """
    User Registration Endpoint

    Purpose:
        Creates a new user account in both Django and Supabase Auth.
        Automatically creates the base Profile and role-specific profile
        (ParentProfile or StudentProfile).

    HTTP Method: POST
    URL: /api/v1/auth/register/
    Permissions: AllowAny (public)

    Request Body:
        {
            "email": "user@example.com",
            "password": "SecurePass123!",
            "confirm_password": "SecurePass123!",
            "full_name": "John Doe",
            "role": "parent" | "student",
            "phone_number": "+27123456789"  (optional)
        }

    Success Response (201):
        {
            "status": "success",
            "message": "User registered successfully",
            "data": {
                "user": {...},
                "tokens": {"refresh": "...", "access": "..."}
            }
        }

    Error Responses:
        400: Validation errors (password mismatch, duplicate email, etc.)
        500: Server error (database issue, Supabase failure, etc.)
    """
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        """
        Handle user registration request.

        Steps:
        1. Validate input data via RegisterSerializer
        2. Create User in Django
        3. Create Profile and role-specific profile
        4. Attempt to create user in Supabase Auth (non-blocking)
        5. Generate JWT tokens for immediate authentication
        """
        try:
            # Step 1: Validate request data
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data

            # Step 2: Create Django user
            user = User.objects.create_user(
                email=data['email'],
                password=data['password'],
                role=data['role'],
                phone_number=data.get('phone_number', '')
            )

            # Step 3: Create base profile
            Profile.objects.create(
                user=user,
                full_name=data['full_name']
            )

            # Step 4: Create role-specific profile
            if data['role'] == 'parent':
                ParentProfile.objects.create(user=user)
            elif data['role'] == 'student':
                # Parent will be linked later via complete-profile endpoint
                StudentProfile.objects.create(user=user, parent=None)

            # Step 5: Sync with Supabase Auth (best-effort, non-blocking)
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
                if supabase_user and supabase_user.user:
                    user.supabase_id = supabase_user.user.id
                    user.save(update_fields=['supabase_id'])
                    logger.info(f"Supabase user created for {data['email']}")
            except Exception as supabase_error:
                # Log but don't fail — Django user is already created
                logger.error(
                    f"Supabase registration failed for {data['email']}: "
                    f"{str(supabase_error)}"
                )

            # Step 6: Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            logger.info(f"User registered successfully: {user.email}")

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

        except serializers.ValidationError:
            # Let DRF handle validation errors with proper format
            raise
        except Exception as e:
            logger.error(f"Registration failed: {str(e)}", exc_info=True)
            return Response({
                'status': 'error',
                'message': 'Registration failed. Please try again.',
                'data': None,
                'errors': {'detail': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    """
    User Login Endpoint

    Purpose:
        Authenticates a user via email/password and returns JWT tokens.
        Also updates the user's last_login timestamp.

    HTTP Method: POST
    URL: /api/v1/auth/login/
    Permissions: AllowAny (public)

    Request Body:
        {
            "email": "user@example.com",
            "password": "SecurePass123!"
        }

    Success Response (200):
        {
            "status": "success",
            "message": "Login successful",
            "data": {
                "user": {...},
                "profile": {...},
                "tokens": {"refresh": "...", "access": "..."}
            }
        }

    Error Responses:
        400: Validation errors
        401: Invalid credentials
        403: Account deactivated
        500: Server error
    """
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        """Handle login request and return JWT tokens."""
        try:
            # Step 1: Validate input
            serializer = LoginSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            # Step 2: Authenticate
            user = authenticate(request, email=email, password=password)

            if not user:
                logger.warning(f"Failed login attempt for: {email}")
                return Response({
                    'status': 'error',
                    'message': 'Invalid credentials',
                    'data': None,
                    'errors': None
                }, status=status.HTTP_401_UNAUTHORIZED)

            if not user.is_active:
                logger.warning(f"Login attempt on inactive account: {email}")
                return Response({
                    'status': 'error',
                    'message': 'Account is deactivated',
                    'data': None,
                    'errors': None
                }, status=status.HTTP_403_FORBIDDEN)

            # Step 3: Update last login
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])

            # Step 4: Generate tokens
            refresh = RefreshToken.for_user(user)

            # Step 5: Fetch profile (with fallback if missing)
            try:
                profile = Profile.objects.get(user=user)
                profile_data = ProfileSerializer(profile).data
            except Profile.DoesNotExist:
                logger.warning(f"Profile missing for user: {user.email}")
                profile_data = None

            logger.info(f"User logged in: {user.email}")

            return Response({
                'status': 'success',
                'message': 'Login successful',
                'data': {
                    'user': UserSerializer(user).data,
                    'profile': profile_data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                }
            })

        except Exception as e:
            logger.error(f"Login failed: {str(e)}", exc_info=True)
            return Response({
                'status': 'error',
                'message': 'Login failed. Please try again.',
                'data': None,
                'errors': {'detail': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LogoutView(APIView):
    """
    User Logout Endpoint

    Purpose:
        Blacklists the provided refresh token so it can no longer
        be used to obtain new access tokens.

    HTTP Method: POST
    URL: /api/v1/auth/logout/
    Permissions: IsAuthenticated

    Request Body:
        {"refresh": "refresh_token_string"}

    Success Response (200):
        {"status": "success", "message": "Logged out successfully"}
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Blacklist the refresh token to log user out."""
        try:
            refresh_token = request.data.get('refresh')

            if not refresh_token:
                return Response({
                    'status': 'error',
                    'message': 'Refresh token is required',
                    'data': None,
                    'errors': {'refresh': ['This field is required']}
                }, status=status.HTTP_400_BAD_REQUEST)

            # Blacklist token
            token = RefreshToken(refresh_token)
            token.blacklist()

            logger.info(f"User logged out: {request.user.email}")

            return Response({
                'status': 'success',
                'message': 'Logged out successfully',
                'data': None,
                'errors': None
            })

        except Exception as e:
            logger.error(f"Logout failed: {str(e)}", exc_info=True)
            return Response({
                'status': 'error',
                'message': 'Logout failed',
                'data': None,
                'errors': {'detail': str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)


class ProfileViewSet(viewsets.ModelViewSet):
    """
    Profile ViewSet

    Purpose:
        Provides CRUD operations for user profiles.
        Automatically includes role-specific data (ParentProfile or StudentProfile).

    HTTP Methods: GET, PUT, PATCH
    URL: /api/v1/auth/profile/
    Permissions: IsAuthenticated

    Response includes:
        - Base profile fields (full_name, avatar_url, etc.)
        - Role-specific profile nested object
    """
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return only the current user's profile."""
        try:
            return Profile.objects.filter(user=self.request.user)
        except Exception as e:
            logger.error(f"Profile queryset error: {str(e)}")
            return Profile.objects.none()

    def retrieve(self, request, *args, **kwargs):
        """
        Get current user's profile with role-specific data.

        Returns:
            Profile data merged with ParentProfile or StudentProfile
        """
        try:
            profile = Profile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            data = serializer.data

            # Attach role-specific profile
            if request.user.role == 'parent':
                try:
                    parent_profile = ParentProfile.objects.get(user=request.user)
                    data['parent_profile'] = ParentProfileSerializer(parent_profile).data
                except ParentProfile.DoesNotExist:
                    data['parent_profile'] = None

            elif request.user.role == 'student':
                try:
                    student_profile = StudentProfile.objects.get(user=request.user)
                    data['student_profile'] = StudentProfileSerializer(student_profile).data
                except StudentProfile.DoesNotExist:
                    data['student_profile'] = None

            return Response({
                'status': 'success',
                'message': 'Profile retrieved successfully',
                'data': data,
                'errors': None
            })

        except Profile.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Profile not found',
                'data': None,
                'errors': None
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Profile retrieve error: {str(e)}", exc_info=True)
            return Response({
                'status': 'error',
                'message': 'Failed to retrieve profile',
                'data': None,
                'errors': {'detail': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChangePasswordView(APIView):
    """
    Change Password Endpoint

    Purpose:
        Allows authenticated users to change their password.
        Validates the old password before setting the new one.
        Syncs password change with Supabase.

    HTTP Method: POST
    URL: /api/v1/auth/change-password/
    Permissions: IsAuthenticated

    Request Body:
        {
            "old_password": "OldPass123!",
            "new_password": "NewPass123!",
            "confirm_password": "NewPass123!"
        }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Handle password change request."""
        try:
            # Step 1: Validate input
            serializer = ChangePasswordSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            user = request.user

            # Step 2: Verify old password
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({
                    'status': 'error',
                    'message': 'Old password is incorrect',
                    'data': None,
                    'errors': {'old_password': ['Incorrect password']}
                }, status=status.HTTP_400_BAD_REQUEST)

            # Step 3: Set new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()

            # Step 4: Sync with Supabase (best-effort)
            try:
                supabase.auth.update_user({
                    "password": serializer.validated_data['new_password']
                })
            except Exception as supabase_error:
                logger.warning(f"Supabase password sync failed: {str(supabase_error)}")

            logger.info(f"Password changed for user: {user.email}")

            return Response({
                'status': 'success',
                'message': 'Password changed successfully',
                'data': None,
                'errors': None
            })

        except Exception as e:
            logger.error(f"Change password error: {str(e)}", exc_info=True)
            return Response({
                'status': 'error',
                'message': 'Failed to change password',
                'data': None,
                'errors': {'detail': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ForgotPasswordView(APIView):
    """
    Forgot Password Endpoint

    Purpose:
        Initiates password reset flow by sending an email with a reset token.
        Uses cache to store tokens with 1-hour expiry.

    HTTP Method: POST
    URL: /api/v1/auth/forgot-password/
    Permissions: AllowAny

    Request Body:
        {"email": "user@example.com"}

    Security Note:
        Always returns success message regardless of whether email exists
        to prevent user enumeration attacks.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """Send password reset email."""
        try:
            # Step 1: Validate email
            serializer = ForgotPasswordSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            email = serializer.validated_data['email']

            # Step 2: Generate and store reset token
            try:
                user = User.objects.get(email=email)

                # Generate secure random token
                reset_token = ''.join(
                    random.choices(string.ascii_letters + string.digits, k=64)
                )

                # Store in cache for 1 hour
                cache.set(f'password_reset_{reset_token}', user.id, timeout=3600)

                # Step 3: Send email
                reset_link = f"https://hapopay.com/reset-password?token={reset_token}"

                try:
                    send_mail(
                        subject='Password Reset Request - HapoPay',
                        message=(
                            f'Click the link to reset your password:\n\n'
                            f'{reset_link}\n\n'
                            f'This link expires in 1 hour.\n\n'
                            f'If you did not request this, please ignore this email.'
                        ),
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[email],
                        fail_silently=False,
                    )
                    logger.info(f"Password reset email sent to: {email}")
                except Exception as email_error:
                    # Log email error but don't reveal to user
                    logger.error(f"Failed to send reset email: {str(email_error)}")

            except User.DoesNotExist:
                # Do not reveal whether user exists
                logger.info(f"Password reset requested for non-existent email: {email}")

            # Always return success to prevent user enumeration
            return Response({
                'status': 'success',
                'message': 'If an account exists, a reset email has been sent',
                'data': None,
                'errors': None
            })

        except Exception as e:
            logger.error(f"Forgot password error: {str(e)}", exc_info=True)
            return Response({
                'status': 'error',
                'message': 'Request failed. Please try again.',
                'data': None,
                'errors': {'detail': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResetPasswordView(APIView):
    """
    Reset Password Endpoint

    Purpose:
        Completes password reset using the token sent via email.
        Validates token from cache and sets new password.

    HTTP Method: POST
    URL: /api/v1/auth/reset-password/
    Permissions: AllowAny

    Request Body:
        {
            "token": "reset_token_from_email",
            "new_password": "NewPass123!",
            "confirm_password": "NewPass123!"
        }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """Reset password using token."""
        try:
            # Step 1: Validate input
            serializer = ResetPasswordSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']

            # Step 2: Verify token from cache
            user_id = cache.get(f'password_reset_{token}')

            if not user_id:
                return Response({
                    'status': 'error',
                    'message': 'Invalid or expired token',
                    'data': None,
                    'errors': {'token': ['Invalid or expired']}
                }, status=status.HTTP_400_BAD_REQUEST)

            # Step 3: Update password
            try:
                user = User.objects.get(id=user_id)
                user.set_password(new_password)
                user.save()

                # Invalidate token
                cache.delete(f'password_reset_{token}')

                # Sync with Supabase
                try:
                    supabase.auth.update_user({"password": new_password})
                except Exception as supabase_error:
                    logger.warning(f"Supabase password sync failed: {str(supabase_error)}")

                logger.info(f"Password reset completed for: {user.email}")

                return Response({
                    'status': 'success',
                    'message': 'Password reset successfully',
                    'data': None,
                    'errors': None
                })

            except User.DoesNotExist:
                return Response({
                    'status': 'error',
                    'message': 'User not found',
                    'data': None,
                    'errors': None
                }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Reset password error: {str(e)}", exc_info=True)
            return Response({
                'status': 'error',
                'message': 'Password reset failed',
                'data': None,
                'errors': {'detail': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CompleteProfileView(APIView):
    """
    Complete Profile Endpoint

    Purpose:
        Completes profile information after initial registration.
        For parents: sets occupation, currency preferences.
        For students: links to parent and adds school details.

    HTTP Method: POST
    URL: /api/v1/auth/complete-profile/
    Permissions: IsAuthenticated

    Request Body (Parent):
        {
            "occupation": "Software Engineer",
            "default_currency": "ZAR"
        }

    Request Body (Student):
        {
            "parent_email": "parent@example.com",
            "school_name": "Springfield High",
            "grade": 10,
            "weekly_allowance": 100.00,
            "savings_goal": 500.00
        }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Complete user profile after registration."""
        try:
            # Step 1: Validate input
            serializer = CompleteProfileSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            user = request.user
            data = serializer.validated_data

            # Step 2: Handle based on role
            if user.role == 'parent':
                try:
                    parent_profile = ParentProfile.objects.get(user=user)
                    parent_profile.occupation = data.get(
                        'occupation', parent_profile.occupation
                    )
                    parent_profile.default_currency = data.get(
                        'default_currency', parent_profile.default_currency
                    )
                    parent_profile.save()
                except ParentProfile.DoesNotExist:
                    return Response({
                        'status': 'error',
                        'message': 'Parent profile not found',
                        'data': None,
                        'errors': None
                    }, status=status.HTTP_404_NOT_FOUND)

            elif user.role == 'student':
                try:
                    student_profile = StudentProfile.objects.get(user=user)

                    # Link to parent if provided
                    if 'parent_email' in data:
                        try:
                            parent = User.objects.get(
                                email=data['parent_email'],
                                role='parent'
                            )
                            student_profile.parent = parent
                        except User.DoesNotExist:
                            return Response({
                                'status': 'error',
                                'message': 'Parent not found',
                                'data': None,
                                'errors': {'parent_email': ['No parent found with this email']}
                            }, status=status.HTTP_404_NOT_FOUND)

                    # Update fields (only if provided)
                    if 'school_name' in data:
                        student_profile.school_name = data['school_name']
                    if 'grade' in data:
                        student_profile.grade = data['grade']
                    if 'weekly_allowance' in data:
                        student_profile.weekly_allowance = data['weekly_allowance']
                    if 'savings_goal' in data:
                        student_profile.savings_goal = data['savings_goal']

                    student_profile.save()

                except StudentProfile.DoesNotExist:
                    return Response({
                        'status': 'error',
                        'message': 'Student profile not found',
                        'data': None,
                        'errors': None
                    }, status=status.HTTP_404_NOT_FOUND)

            logger.info(f"Profile completed for user: {user.email}")

            return Response({
                'status': 'success',
                'message': 'Profile completed successfully',
                'data': None,
                'errors': None
            })

        except Exception as e:
            logger.error(f"Complete profile error: {str(e)}", exc_info=True)
            return Response({
                'status': 'error',
                'message': 'Failed to complete profile',
                'data': None,
                'errors': {'detail': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RoleSwitchView(APIView):
    """
    Role Switch Endpoint

    Purpose:
        Allows users to switch between roles. Useful for testing
        or for users who have multiple role responsibilities.

    HTTP Method: POST
    URL: /api/v1/auth/switch-role/
    Permissions: IsAuthenticated

    Request Body:
        {"role": "parent" | "student" | "admin"}
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Switch user's current role."""
        try:
            role = request.data.get('role')

            # Validate role
            if role not in ['parent', 'student', 'admin']:
                return Response({
                    'status': 'error',
                    'message': 'Invalid role',
                    'data': None,
                    'errors': {'role': ['Must be one of: parent, student, admin']}
                }, status=status.HTTP_400_BAD_REQUEST)

            # Update role
            request.user.role = role
            request.user.save(update_fields=['role'])

            logger.info(f"User {request.user.email} switched role to: {role}")

            return Response({
                'status': 'success',
                'message': f'Switched to {role} role',
                'data': {'role': role},
                'errors': None
            })

        except Exception as e:
            logger.error(f"Role switch error: {str(e)}", exc_info=True)
            return Response({
                'status': 'error',
                'message': 'Failed to switch role',
                'data': None,
                'errors': {'detail': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)