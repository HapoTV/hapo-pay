# apps/accounts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'profile', views.ProfileViewSet, basename='profile')

urlpatterns = [
    # Authentication
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    # SIMPLE_JWT is configured for rotation with a 7-day refresh lifetime, but
    # no route ever exposed the refresh exchange, so every session ended hard
    # when the access token expired and the client had to re-prompt for a
    # password. The web client already calls this path.
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', views.ResetPasswordView.as_view(), name='reset-password'),
    path('complete-profile/', views.CompleteProfileView.as_view(), name='complete-profile'),
    path('switch-role/', views.RoleSwitchView.as_view(), name='switch-role'),

    # Profile
    path('', include(router.urls)),
]