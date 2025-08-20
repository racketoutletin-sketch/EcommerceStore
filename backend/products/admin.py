from django.contrib import admin
from .models import Category, Product, ProductImage, Inventory

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    ordering = ('name',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'discounted_price', 'sku', 'is_featured', 'is_active', 'created_at')
    list_filter = ('category', 'is_featured', 'is_active')
    search_fields = ('name', 'sku', 'brand')
    ordering = ('name',)

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'alt_text', 'is_primary')
    list_filter = ('is_primary',)
    search_fields = ('product__name', 'alt_text')
    ordering = ('product',)

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'quantity', 'low_stock_threshold', 'last_restocked_at', 'is_low_stock')
    list_filter = ('product',)
    search_fields = ('product__name',)
    ordering = ('product',)
    
    # Make is_low_stock a boolean field in admin
    def is_low_stock(self, obj):
        return obj.is_low_stock
    is_low_stock.boolean = True
    is_low_stock.short_description = 'Low Stock?'
