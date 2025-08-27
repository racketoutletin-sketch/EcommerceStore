from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Banner
from .serializers import BannerSerializer

class BannerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint to view banners (list & detail).
    Public: No authentication required
    """
    queryset = Banner.objects.all().order_by("-created_at")
    serializer_class = BannerSerializer
    permission_classes = [AllowAny]  # ✅ No auth required


# home/views.py
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import HomeCategories
from .serializers import HomeCategoriesSerializer


class HomeCategoriesViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint to view Home Categories.
    """
    queryset = HomeCategories.objects.all().order_by("-created_at")
    serializer_class = HomeCategoriesSerializer
    permission_classes = [AllowAny]


from rest_framework import viewsets
from .models import HomeVideo
from .serializers import HomeVideoSerializer

class HomeVideoViewSet(viewsets.ModelViewSet):
    queryset = HomeVideo.objects.all().order_by("-created_at")
    serializer_class = HomeVideoSerializer
    permission_classes = [AllowAny]


from rest_framework import viewsets
from .models import ExclusiveProduct
from .serializers import ExclusiveProductSerializer


class ExclusiveProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for Exclusive Products
    Read-only because we only list/show
    """
    queryset = ExclusiveProduct.objects.select_related("product").order_by("-created_at")
    serializer_class = ExclusiveProductSerializer
    permission_classes = [AllowAny]


from rest_framework import viewsets
from .models import *
from .serializers import *


class FeaturedProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for Featured Products
    Read-only because we only list/show
    """
    queryset = FeaturedProduct.objects.select_related("product").order_by("-created_at")
    serializer_class = FeaturedProductSerializer
    permission_classes = [AllowAny]

from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import ShopTheLook
from .serializers import ShopTheLookSerializer

class ShopTheLookViewSet(viewsets.ModelViewSet):
    queryset = ShopTheLook.objects.all()
    serializer_class = ShopTheLookSerializer
    permission_classes = [AllowAny]
