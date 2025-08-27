from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import (
    Banner,
    HomeCategories,
    HomeVideo,
    ExclusiveProduct,
    FeaturedProduct,
    ShopTheLook,
)
from .serializers import (
    BannerSerializer,
    HomeCategoriesSerializer,
    HomeVideoSerializer,
    ExclusiveProductSerializer,
    FeaturedProductSerializer,
    ShopTheLookSerializer,
)


# -------------------------
# Banner ViewSet
# -------------------------
class BannerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint to view banners (list & detail).
    Public: No authentication required.
    """
    queryset = Banner.objects.all().order_by("-created_at")
    serializer_class = BannerSerializer
    permission_classes = [AllowAny]


# -------------------------
# HomeCategories ViewSet
# -------------------------
class HomeCategoriesViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint to view Home Categories.
    """
    queryset = HomeCategories.objects.all().order_by("-created_at")
    serializer_class = HomeCategoriesSerializer
    permission_classes = [AllowAny]


# -------------------------
# HomeVideo ViewSet
# -------------------------
class HomeVideoViewSet(viewsets.ModelViewSet):
    """
    API endpoint to list, create, update, and delete Home Videos.
    """
    queryset = HomeVideo.objects.all().order_by("-created_at")
    serializer_class = HomeVideoSerializer
    permission_classes = [AllowAny]


# -------------------------
# ExclusiveProduct ViewSet
# -------------------------
class ExclusiveProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for Exclusive Products (Read-only).
    """
    queryset = ExclusiveProduct.objects.select_related("product").order_by("-created_at")
    serializer_class = ExclusiveProductSerializer
    permission_classes = [AllowAny]


# -------------------------
# FeaturedProduct ViewSet
# -------------------------
class FeaturedProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for Featured Products (Read-only).
    """
    queryset = FeaturedProduct.objects.select_related("product").order_by("-created_at")
    serializer_class = FeaturedProductSerializer
    permission_classes = [AllowAny]


# -------------------------
# ShopTheLook ViewSet
# -------------------------
class ShopTheLookViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Shop The Look.
    Allows full CRUD operations.
    """
    queryset = ShopTheLook.objects.all()
    serializer_class = ShopTheLookSerializer
    permission_classes = [AllowAny]
