# apps/accounts/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
import uuid


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('parent', 'Parent'),
        ('student', 'Student'),
        ('admin', 'Admin'),
        ('merchant', 'Merchant'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='parent')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)
    supabase_id = models.UUIDField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email} ({self.role})"

    def get_full_name(self):
        try:
            return self.profile.full_name
        except:
            return self.email

    def get_short_name(self):
        return self.email.split('@')[0]


class Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255)
    avatar_url = models.URLField(blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, default='South Africa')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'profiles'

    def __str__(self):
        return f"{self.full_name} - {self.user.email}"


class ParentProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='parent_profile')
    occupation = models.CharField(max_length=200, blank=True, null=True)
    notification_preferences = models.JSONField(default=dict)
    is_verified = models.BooleanField(default=False)
    verification_document = models.URLField(blank=True, null=True)
    default_currency = models.CharField(max_length=3, default='ZAR')

    class Meta:
        db_table = 'parent_profiles'

    def __str__(self):
        return f"Parent: {self.user.email}"


class StudentProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='children',
                               limit_choices_to={'role': 'parent'}, null=True, blank=True)
    school_name = models.CharField(max_length=200, blank=True, null=True)
    grade = models.IntegerField(null=True, blank=True)
    weekly_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    savings_goal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_account_frozen = models.BooleanField(default=False)
    freeze_reason = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'student_profiles'

    def __str__(self):
        parent_email = self.parent.email if self.parent else "No parent assigned"
        return f"Student: {self.user.email} (Parent: {parent_email})"


class AdminProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    department = models.CharField(max_length=100, default='General')
    permissions_level = models.IntegerField(default=1)
    is_super_admin = models.BooleanField(default=False)

    class Meta:
        db_table = 'admin_profiles'

    def __str__(self):
        return f"Admin: {self.user.email}"

