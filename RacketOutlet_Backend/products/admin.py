from django.contrib import admin
from .models import Category, SubCategory, Product, ProductImage, Inventory

# ---------------------------
# Category Admin
# ---------------------------
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at', 'updated_at')  # removed 'parent'
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    ordering = ('name',)

# ---------------------------
# SubCategory Admin
# ---------------------------
@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent_category', 'is_active', 'is_featured', 'created_at')
    list_filter = ('parent_category', 'is_active', 'is_featured')
    search_fields = ('name', 'description')
    ordering = ('name',)

# ---------------------------
# Product Admin
# ---------------------------
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'subcategory_name', 'price', 'discounted_price', 'sku', 'is_featured', 'is_active', 'created_at')
    list_filter = ('subcategory', 'is_featured', 'is_active')
    search_fields = ('name', 'sku', 'brand')
    ordering = ('name',)

    def subcategory_name(self, obj):
        """Show Category -> SubCategory for admin display"""
        return f"{obj.subcategory.parent_category.name} -> {obj.subcategory.name}"
    subcategory_name.short_description = 'Category'

# ---------------------------
# ProductImage Admin
# ---------------------------
@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'alt_text', 'is_primary')
    list_filter = ('is_primary',)
    search_fields = ('product__name', 'alt_text')
    ordering = ('product',)

# ---------------------------
# Inventory Admin
# ---------------------------
@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'quantity', 'low_stock_threshold', 'last_restocked_at', 'is_low_stock_display')
    list_filter = ('product',)
    search_fields = ('product__name',)
    ordering = ('product',)

    def is_low_stock_display(self, obj):
        return obj.is_low_stock
    is_low_stock_display.boolean = True
    is_low_stock_display.short_description = 'Low Stock?'
