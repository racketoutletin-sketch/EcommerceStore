import os
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from common.supabase_storage_backend import SupabaseStorage


def get_supabase_storage():
    return SupabaseStorage()


class User(AbstractUser):
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('vendor', 'Vendor'),
        ('admin', 'Admin'),
        ('staff', 'Staff'),
    )

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'phone_number']

    def __str__(self):
        return f"{self.email} ({self.role})"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    # ✅ Refactored to use Supabase storage
    profile_picture = models.ImageField(
        storage=get_supabase_storage,
        upload_to="profile_pictures/",
        blank=True,
        null=True
    )
    profile_picture_url = models.URLField(blank=True, null=True)

    date_of_birth = models.DateField(blank=True, null=True)
    preferences = models.JSONField(default=dict, blank=True)

    def save(self, *args, **kwargs):
        """
        Save model, then update profile_picture_url with Supabase public URL.
        """
        super().save(*args, **kwargs)
        if self.profile_picture and self.profile_picture.name:
            url = self.profile_picture.storage.url(self.profile_picture.name)
            if url != self.profile_picture_url:
                self.profile_picture_url = url
                super().save(update_fields=["profile_picture_url"])

    def delete(self, *args, **kwargs):
        """
        Delete file from Supabase first, then DB record.
        """
        if self.profile_picture and self.profile_picture.name:
            self.profile_picture.storage.delete(self.profile_picture.name)
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email}'s Profile"
