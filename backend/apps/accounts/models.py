# apps/accounts/models.py
"""
Accounts Models Module
======================
Defines the core user models for HapoPay:

- User: Custom user model with role-based access
- Profile: Shared profile info for all users
- ParentProfile: Extended info for parents
- StudentProfile: Extended info for students (linked to parent)
- AdminProfile: Extended info for admins

All models use UUID primary keys for security and scalability.
"""

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
import uuid


class UserManager(BaseUserManager):
    """
    Custom manager for the User model.

    Handles user creation with proper password hashing
    and email normalization.
    """

    def create_user(self, email, password=None, **extra_fields):
        """
        Create and return a regular user.

        Args:
            email: User's email address (required)
            password: Raw password (will be hashed)
            **extra_fields: Additional User fields

        Raises:
            ValueError: If email is not provided
        """
        if not email:
            raise ValueError('Email address is required')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and return a superuser with admin privileges.

        Args:
            email: Admin email address
            password: Raw password
            **extra_fields: Additional User fields
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User Model

    Extends Django's AbstractBaseUser to support:
    - Email-based authentication (instead of username)
    - Role-based access control (parent/student/admin)
    - Supabase Auth synchronization via supabase_id

    Roles:
        - parent: Can manage children and funds
        - student: Can make payments and request funds
        - admin: Full system access
    """

    ROLE_CHOICES = [
        ('parent', 'Parent'),
        ('student', 'Student'),
        ('admin', 'Admin'),
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
    supabase_id = models.UUIDField(null=True, blank=True, db_index=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['supabase_id']),
        ]

    def __str__(self):
        return f"{self.email} ({self.role})"

    def get_full_name(self):
        """Return user's full name from profile, or email as fallback."""
        try:
            return self.profile.full_name
        except Profile.DoesNotExist:
            return self.email

    def get_short_name(self):
        """Return the part of email before @ symbol."""
        return self.email.split('@')[0]

    @property
    def is_parent(self):
        """Check if user is a parent."""
        return self.role == 'parent'

    @property
    def is_student(self):
        """Check if user is a student."""
        return self.role == 'student'

    @property
    def is_admin(self):
        """Check if user is an admin."""
        return self.role == 'admin'


class Profile(models.Model):
    """
    Shared Profile Model

    Stores personal information common to all user roles.
    One-to-one relationship with User.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
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
    """
    Parent-Specific Profile

    Extends user profile with parent-specific attributes:
    - Occupation
    - Verification status
    - Notification preferences
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='parent_profile'
    )
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
    """
    Student-Specific Profile

    Extends user profile with student-specific attributes:
    - Parent linkage
    - School information
    - Allowance and savings settings
    - Account freeze capability (set by parent)
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='student_profile'
    )
    parent = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='children',
        limit_choices_to={'role': 'parent'},
        null=True,
        blank=True
    )
    school_name = models.CharField(max_length=200, blank=True, null=True)
    grade = models.IntegerField(null=True, blank=True)
    weekly_allowance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    savings_goal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    is_account_frozen = models.BooleanField(default=False)
    freeze_reason = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'student_profiles'

    def __str__(self):
        parent_email = self.parent.email if self.parent else "No parent assigned"
        return f"Student: {self.user.email} (Parent: {parent_email})"


class AdminProfile(models.Model):
    """
    Admin-Specific Profile

    Extends user profile with admin-specific attributes:
    - Department
    - Permission level
    - Super admin flag
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='admin_profile'
    )
    department = models.CharField(max_length=100, default='General')
    permissions_level = models.IntegerField(default=1)
    is_super_admin = models.BooleanField(default=False)

    class Meta:
        db_table = 'admin_profiles'

    def __str__(self):
        return f"Admin: {self.user.email}"