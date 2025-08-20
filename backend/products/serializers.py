# products/serializers.py
from rest_framework import serializers
from .models import Category, Product, ProductImage, Inventory

class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ('id', 'name', 'description', 'parent', 'image', 'is_active', 'children')
    
    def get_children(self, obj):
        if obj.children.exists():
            return CategorySerializer(obj.children.all(), many=True).data
        return []

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'alt_text', 'is_primary')

class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = ('quantity', 'low_stock_threshold', 'is_low_stock')
        read_only_fields = ('is_low_stock',)

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    inventory = InventorySerializer(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product
        fields = ('id', 'name', 'description', 'category', 'category_name', 'price', 
                  'discounted_price', 'sku', 'brand', 'weight', 'dimensions', 'material',
                  'is_featured', 'is_active', 'images', 'inventory', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        # Create product
        product = Product.objects.create(**validated_data)
        
        # Create inventory for the product
        Inventory.objects.create(product=product)
        
        return product

class ProductListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product
        fields = ('id', 'name', 'price', 'discounted_price', 'sku', 'brand', 
                  'is_featured', 'is_active', 'primary_image', 'category_name')
    
    def get_primary_image(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image:
            return ProductImageSerializer(primary_image).data
        # If no primary image, return the first image
        first_image = obj.images.first()
        if first_image:
            return ProductImageSerializer(first_image).data
        return None