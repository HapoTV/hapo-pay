# apps/accounts/urls.py
"""
URL configuration for the accounts app.

This module defines all URL routes for user authentication and profile management.
It uses Django REST Framework's DefaultRouter for ViewSet-based routes and
explicit path() calls for APIView-based routes.

Routes handled here:
    - User registration (parent/student)
    - Login / Logout
    - Password change / reset
    - Profile completion
    - Role switching
    - Profile retrieval and updates
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


# ---------------------------------------------------------------------------
# Router registration
# ---------------------------------------------------------------------------
# DefaultRouter automatically generates URL patterns for ViewSets.
# The 'profile' route supports GET, PUT, PATCH for the authenticated user.
#   GET    /api/v1/auth/profile/       → list profile(s)
#   GET    /api/v1/auth/profile/{id}/  → retrieve a specific profile
#   PUT    /api/v1/auth/profile/{id}/  → update a profile
#   PATCH  /api/v1/auth/profile/{id}/  → partial update
# ---------------------------------------------------------------------------
router = DefaultRouter()
router.register(r'profile', views.ProfileViewSet, basename='profile')


# ---------------------------------------------------------------------------
# URL patterns
# ---------------------------------------------------------------------------
urlpatterns = [
    # -----------------------------------------------------------------------
    # Authentication endpoints
    # -----------------------------------------------------------------------

    # POST /api/v1/auth/register/
    # Create a new user account (parent or student).
    # Public endpoint — no authentication required.
    path('register/', views.RegisterView.as_view(), name='register'),

    # POST /api/v1/auth/login/
    # Authenticate with email and password. Returns JWT access and refresh tokens.
    # Public endpoint — no authentication required.
    path('login/', views.LoginView.as_view(), name='login'),

    # POST /api/v1/auth/logout/
    # Invalidate the current user's refresh token (blacklist it).
    # Requires: IsAuthenticated
    path('logout/', views.LogoutView.as_view(), name='logout'),

    # POST /api/v1/auth/change-password/
    # Change the authenticated user's password.
    # Requires: IsAuthenticated
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),

    # POST /api/v1/auth/forgot-password/
    # Request a password reset email. Sends a reset link with a token.
    # Public endpoint — no authentication required.
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot-password'),

    # POST /api/v1/auth/reset-password/
    # Reset password using the token received via email.
    # Public endpoint — no authentication required.
    path('reset-password/', views.ResetPasswordView.as_view(), name='reset-password'),

    # POST /api/v1/auth/complete-profile/
    # Complete the user's profile after registration (parent or student specific data).
    # Requires: IsAuthenticated
    path('complete-profile/', views.CompleteProfileView.as_view(), name='complete-profile'),

    # POST /api/v1/auth/switch-role/
    # Switch the current user's role (parent ↔ student). For testing/admin use.
    # Requires: IsAuthenticated
    path('switch-role/', views.RoleSwitchView.as_view(), name='switch-role'),

    # -----------------------------------------------------------------------
    # Profile routes (registered via router above)
    # -----------------------------------------------------------------------
    path('', include(router.urls)),
]