from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .serializers import RegisterSerializer, UserSerializer, UserProfileSerializer, MyTokenObtainPairSerializer
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

