from django.contrib import admin
from .models import Category, SubCategory, Product, ProductImage, Inventory

# ---------------------------
# Category Admin
# ---------------------------
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at', 'updated_at')
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

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('parent_category').only(
            'id', 'name', 'description', 'is_active', 'is_featured', 'created_at', 'parent_category'
        )


# ---------------------------
# Product Admin
# ---------------------------
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'subcategory_name', 'price', 'discounted_price',
        'sku', 'is_featured', 'is_active', 'created_at'
    )
    list_filter = ('is_featured', 'is_active')  # ⚡ removed subcategory filter (too heavy)
    search_fields = ('name', 'sku', 'brand')
    ordering = ('name',)
    list_per_page = 50

    # Use autocomplete instead of heavy dropdown for subcategory
    autocomplete_fields = ('subcategory',)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('subcategory', 'subcategory__parent_category').only(
            'id', 'name', 'price', 'discounted_price', 'sku',
            'is_featured', 'is_active', 'created_at', 'subcategory__id',
            'subcategory__name', 'subcategory__parent_category__id',
            'subcategory__parent_category__name'
        )

    def subcategory_name(self, obj):
        return f"{obj.subcategory.parent_category.name} -> {obj.subcategory.name}"
    subcategory_name.short_description = 'Category'


# ---------------------------
# ProductImage Admin
# ---------------------------
@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'alt_text', 'is_primary')
    list_filter = ('is_primary',)
    search_fields = ('alt_text', 'product__name')
    ordering = ('product',)

    # ⚡ Use autocomplete for product to avoid huge dropdowns
    autocomplete_fields = ('product',)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('product').only('id', 'alt_text', 'is_primary', 'product__id', 'product__name')


# ---------------------------
# Inventory Admin
# ---------------------------
@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'quantity', 'low_stock_threshold', 'last_restocked_at', 'is_low_stock_display')
    list_filter = ()  # ⚡ removed product filter (too heavy on large data)
    search_fields = ('product__name',)
    ordering = ('product',)
    list_per_page = 50

    # ⚡ Use autocomplete instead of dropdown
    autocomplete_fields = ('product',)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('product').only(
            'id', 'quantity', 'low_stock_threshold', 'last_restocked_at',
            'product__id', 'product__name'
        )

    def is_low_stock_display(self, obj):
        return obj.is_low_stock
    is_low_stock_display.boolean = True
    is_low_stock_display.short_description = 'Low Stock?'
