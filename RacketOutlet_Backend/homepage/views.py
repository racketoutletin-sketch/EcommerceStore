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
from rest_framework.views import APIView
from rest_framework.response import Response
from products.models import Category  # adjust if the model is different
from products.serializers import CategoryWithSubSerializer


class HomePageView(APIView):
    """    A single API endpoint that aggregates all homepage data.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        banners = BannerSerializer(Banner.objects.all().order_by("-created_at"), many=True).data
        categories = HomeCategoriesSerializer(HomeCategories.objects.all().order_by("-created_at"), many=True).data
        videos = HomeVideoSerializer(HomeVideo.objects.all().order_by("-created_at"), many=True).data
        exclusive_products = ExclusiveProductSerializer(
            ExclusiveProduct.objects.select_related("product").order_by("-created_at"), many=True
        ).data
        featured_products = FeaturedProductSerializer(
            FeaturedProduct.objects.select_related("product").order_by("-created_at"), many=True
        ).data
        shop_the_look = ShopTheLookSerializer(ShopTheLook.objects.all().order_by("-id"), many=True).data
        # featured_categories = FeaturedCategorySerializer(
        #     Category.objects.filter(is_featured=True, is_active=True).order_by("id"), many=True
        # ).data
        featured_categories = CategoryWithSubSerializer(
    Category.objects.filter(is_featured=True, is_active=True).prefetch_related("subcategories").order_by("id"),
    many=True
).data

        return Response({
            "featured_categories": featured_categories,   # ✅ added
            "banners": banners,
            "categories": categories,
            "videos": videos,
            "exclusive_products": exclusive_products,
            "shop_the_look": shop_the_look,
            "featured_products": featured_products,
        })



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
