from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .serializers import RegisterSerializer, UserSerializer, UserProfileSerializer, MyTokenObtainPairSerializer, PasswordResetRequestSerializer, SetNewPasswordSerializer
from .models import UserProfile

User = get_user_model()


# Register new user
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


# Login View (JWT token generation)
class LoginView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]

# Get user profile
class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)


# Update user profile
from rest_framework import generics, permissions
from users.models import UserProfile
from users.serializers import UserProfileSerializer

class UpdateUserProfileView(generics.UpdateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.profile

    def patch(self, request, *args, **kwargs):
        # Update nested user fields (first_name, last_name)
        user_data = {}
        if "first_name" in request.data:
            user_data["first_name"] = request.data["first_name"]
        if "last_name" in request.data:
            user_data["last_name"] = request.data["last_name"]

        if user_data:
            for key, value in user_data.items():
                setattr(request.user, key, value)
            request.user.save()

        return self.partial_update(request, *args, **kwargs)

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import ChangePasswordSerializer

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions
import os
from django.contrib.auth import get_user_model
from .serializers import PasswordResetRequestSerializer

User = get_user_model()

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Always return same response to avoid exposing email
            return Response({"detail": "If this email exists, a reset link will be sent."}, status=200)

        # Token and UID generation
        token_generator = PasswordResetTokenGenerator()
        token = token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))  # string, no decode()

        # Frontend URL from env (fallback for dev)
        frontend_url = os.getenv("FRONTEND_URL")
        reset_url = f"{frontend_url}/reset-password?uid={uid}&token={token}"

        # Send email
        send_mail(
            "Password Reset Request",
            f"Click the link to reset your password: {reset_url}",
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False
        )

        return Response({"detail": "If this email exists, a reset link will be sent."}, status=200)



class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SetNewPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid = serializer.validated_data['uidb64']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"detail": "Invalid link"}, status=400)

        token_generator = PasswordResetTokenGenerator()
        if not token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired token"}, status=400)

        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password has been reset successfully."}, status=200)
