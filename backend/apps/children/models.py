"""Child profile model."""
from django.db import models
from django.conf import settings


class Child(models.Model):
    parent = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="children"
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)
    avatar_url = models.URLField(blank=True)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    weekly_limit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "children"
        verbose_name_plural = "children"

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
