# users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile
from drf_extra_fields.fields import Base64ImageField
from rest_framework.parsers import MultiPartParser, FormParser
from common.supabase_storage import upload_file, get_public_url
import uuid

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            'username', 'email', 'first_name', 'last_name',
            'password', 'password_confirm', 'phone_number', 'address'
        )

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class UserProfileSerializer(serializers.ModelSerializer):
    # Accept image upload
    profile_picture = serializers.ImageField(write_only=True, required=False)
    # Always return the Supabase URL
    profile_picture_url = serializers.CharField(read_only=True)

    class Meta:
        model = UserProfile
        fields = ('profile_picture', 'profile_picture_url', 'date_of_birth', 'preferences')

    def update(self, instance, validated_data):
        request = self.context.get('request')

        # Handle profile picture upload
        profile_pic = validated_data.pop('profile_picture', None)
        if profile_pic and request:
            bucket_name = "racketoutlet"
            file_ext = profile_pic.name.split('.')[-1]
            # ✅ Store inside profile_pictures/<user_id>/filename
            file_path = f"profile_pictures/{instance.user.id}/{uuid.uuid4()}.{file_ext}"
            upload_file(bucket_name, file_path, profile_pic)
            instance.profile_picture_url = get_public_url(bucket_name, file_path)

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'address', 'is_customer', 'is_admin', 'profile')
        read_only_fields = ('is_customer', 'is_admin')