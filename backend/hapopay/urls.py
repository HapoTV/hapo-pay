# hapopay/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Swagger/OpenAPI Schema View
schema_view = get_schema_view(
    openapi.Info(
        title="HapoPay API",
        default_version='v1',
        description="HapoPay Smart Student Spending Platform API Documentation",
        terms_of_service="https://www.hapopay.com/terms/",
        contact=openapi.Contact(email="support@hapopay.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('swagger.json/', schema_view.without_ui(cache_timeout=0), name='schema-json'),

    # API Version 1 Routes
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/parent/', include('apps.wallets.urls')),
    path('api/v1/student/', include('apps.wallets.student_urls')),
    path('api/v1/payments/', include('apps.payments.urls')),
    path('api/v1/gamification/', include('apps.gamification.urls')),
    path('api/v1/admin/', include('apps.admin_panel.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)