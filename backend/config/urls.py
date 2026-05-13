"""HapoPay root URL configuration."""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    # JWT auth endpoints
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # App routes
    path("api/users/", include("apps.users.urls")),
    path("api/children/", include("apps.children.urls")),
    path("api/transactions/", include("apps.transactions.urls")),
    path("api/rewards/", include("apps.rewards.urls")),
]
