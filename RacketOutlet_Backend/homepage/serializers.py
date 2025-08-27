from rest_framework import serializers
from .models import (
    Banner,
    HomeCategories,
    HomeVideo,
    ExclusiveProduct,
    FeaturedProduct,
    ShopTheLook,
    Hotspot,
)
from products.models import Product, SubCategory
from products.serializers import ProductSerializer


# -------------------------
# Banner Serializer
# -------------------------
class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ["id", "title", "subtitle", "image", "subcategory", "product"]


# -------------------------
# SubCategory Serializer
# -------------------------
class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ["id", "name", "description", "image"]


# -------------------------
# HomeCategories Serializer
# -------------------------
class HomeCategoriesSerializer(serializers.ModelSerializer):
    subcategory = SubCategorySerializer(read_only=True)

    class Meta:
        model = HomeCategories
        fields = ["id", "subcategory", "created_at"]


# serializers.py
from rest_framework import serializers
from .models import HomeVideo

class HomeVideoSerializer(serializers.ModelSerializer):
    # Ensure video_url is read-only and automatically populated
    video_url = serializers.ReadOnlyField()

    class Meta:
        model = HomeVideo
        fields = ["id", "video", "video_url"]


# -------------------------
# ExclusiveProduct Serializer
# -------------------------
class ExclusiveProductSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = ExclusiveProduct
        fields = ["id", "product", "created_at"]


# -------------------------
# FeaturedProduct Serializer
# -------------------------
class FeaturedProductSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = FeaturedProduct  # fixed: should be FeaturedProduct, not ExclusiveProduct
        fields = ["id", "product", "created_at"]


# -------------------------
# Hotspot Serializer
# -------------------------
class HotspotSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)  # embed full product details

    class Meta:
        model = Hotspot
        fields = ["id", "top", "left", "right", "product"]


# -------------------------
# ShopTheLook Serializer
# -------------------------
class ShopTheLookSerializer(serializers.ModelSerializer):
    hotspots = HotspotSerializer(many=True, read_only=True)  # include all hotspots

    class Meta:
        model = ShopTheLook
        fields = ["id", "title", "player_image", "hotspots"]
