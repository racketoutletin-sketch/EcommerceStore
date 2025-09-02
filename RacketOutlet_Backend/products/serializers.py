from rest_framework import serializers
from .models import Category, SubCategory, Product, ProductImage, Inventory


# -------------------------------
# Product Image Serializer
# -------------------------------
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'alt_text', 'is_primary']


# -------------------------------
# Inventory Serializer
# -------------------------------
class InventorySerializer(serializers.ModelSerializer):
    is_low_stock = serializers.ReadOnlyField()

    class Meta:
        model = Inventory
        fields = ['quantity', 'low_stock_threshold', 'last_restocked_at', 'is_low_stock']


# -------------------------------
# Product Serializer
# -------------------------------
class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    inventory = InventorySerializer(read_only=True)
    current_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    sub_category_id = serializers.IntegerField(source='subcategory.id', read_only=True)
    sub_category_name = serializers.CharField(source='subcategory.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description',
            'price', 'discounted_price', 'current_price',
            'sku', 'brand', 'weight', 'dimensions', 'material',
            'main_image_url', 'extra_attributes',
            'is_featured', 'is_deal_of_the_day', 'is_exclusive_product', 'is_active',
            'images', 'inventory',
            'sub_category_id', 'sub_category_name'
        ]


# -------------------------------
# Featured / Status Product Serializers
# -------------------------------
class FeaturedProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'main_image_url', 'is_active']


class ProductStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'main_image_url', 'is_active']


# -------------------------------
# SubCategory Serializers
# -------------------------------
class SubCategorySerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = SubCategory
        fields = [
            'id', 'name', 'slug', 'description',
            'image_url', 'is_featured', 'is_active',
            'products'
        ]


class FeaturedSubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ['id', 'name', 'slug', 'description', 'image_url', 'is_active']


# -------------------------------
# Category Serializers
# -------------------------------
class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategorySerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description',
            'image_url', 'is_active', 'is_featured',
            'subcategories'
        ]


class FeaturedCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image_url', 'is_active']
