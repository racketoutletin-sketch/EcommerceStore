from rest_framework import serializers
from .models import Banner

class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ["id", "title", "subtitle", "image", "subcategory", "product"]


# home/serializers.py
from rest_framework import serializers
from .models import HomeCategories
from products.models import SubCategory


class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ["id", "name", "description", "image"]


class HomeCategoriesSerializer(serializers.ModelSerializer):
    subcategory = SubCategorySerializer(read_only=True)

    class Meta:
        model = HomeCategories
        fields = ["id", "subcategory", "created_at"]

from rest_framework import serializers
from .models import HomeVideo

class HomeVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeVideo
        fields = ["id", "video", "video_url", "created_at"]


from rest_framework import serializers
from .models import ExclusiveProduct
from products.models import Product
from products.serializers import ProductSerializer

class ExclusiveProductSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = ExclusiveProduct
        fields = ["id", "product", "created_at"]


from rest_framework import serializers
from .models import *
from products.models import Product
from products.serializers import ProductSerializer

class FeaturedProductSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = ExclusiveProduct
        fields = ["id", "product", "created_at"]

        
from rest_framework import serializers
from .models import ShopTheLook, Hotspot
from products.models import Product
from products.serializers import ProductSerializer  # assuming you have this

class HotspotSerializer(serializers.ModelSerializer):
    product = ProductSerializer()  # embed full product details

    class Meta:
        model = Hotspot
        fields = ["id", "top", "left", "right", "product"]


class ShopTheLookSerializer(serializers.ModelSerializer):
    hotspots = HotspotSerializer(many=True, read_only=True)  # include all hotspots

    class Meta:
        model = ShopTheLook
        fields = ["id", "title", "player_image", "hotspots"]
