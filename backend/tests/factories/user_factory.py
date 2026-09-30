# tests/factories/user_factory.py
"""Factory for creating test users."""
import factory
from django.contrib.auth import get_user_model
from apps.accounts.models import Profile, ParentProfile, StudentProfile

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Sequence(lambda n: f'user{n}@test.com')
    role = 'parent'
    is_active = True

    @factory.post_generation
    def password(obj, create, extracted, **kwargs):
        obj.set_password(extracted or 'TestPass123!')
        obj.save()


class ParentUserFactory(UserFactory):
    role = 'parent'

    @factory.post_generation
    def parent_profile(obj, create, extracted, **kwargs):
        if create:
            ParentProfile.objects.create(user=obj)
            Profile.objects.create(user=obj, full_name='Test Parent')


class StudentUserFactory(UserFactory):
    role = 'student'
    parent = factory.SubFactory(ParentUserFactory)

    @factory.post_generation
    def student_profile(obj, create, extracted, **kwargs):
        if create:
            StudentProfile.objects.create(user=obj, parent=obj.parent)
            Profile.objects.create(user=obj, full_name='Test Student')