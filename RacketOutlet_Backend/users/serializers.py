from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import User, UserProfile

User = get_user_model()


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Optional: add extra claims
        token['username'] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Serialize the logged-in user
        from .serializers import UserSerializer
        data["user"] = UserSerializer(self.user).data
        return data



class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'phone_number', 'address', 'password', 'password_confirm']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            address=validated_data.get('address', ''),
            password=validated_data['password']
        )
        # Create UserProfile automatically
        UserProfile.objects.create(user=user)
        return user



class UserSerializer(serializers.ModelSerializer):
    is_customer = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    is_vendor = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'phone_number', 'address', 'role',
            'is_customer', 'is_admin', 'is_vendor'
        ]

    def get_is_customer(self, obj):
        return obj.role == 'customer'

    def get_is_admin(self, obj):
        return obj.role == 'admin'

    def get_is_vendor(self, obj):
        return obj.role == 'vendor'


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    profile_picture_url = serializers.ReadOnlyField()

    class Meta:
        model = UserProfile
        fields = [
            'user',
            'profile_picture',
            'profile_picture_url',
            'date_of_birth',
            'preferences'
        ]

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    new_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})

    def validate_new_password(self, value):
        validate_password(value)
        return value

from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class SetNewPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    uidb64 = serializers.CharField()
    token = serializers.CharField()

    def validate_new_password(self, value):
        validate_password(value)
        return value

