from django.contrib import admin
from .models import Category, SubCategory, Product, ProductImage, Inventory

# ---------------------------
# ProductImage Inline
# ---------------------------
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1  # show 1 extra blank form
    fields = ('image', 'image_url', 'alt_text', 'is_primary')
    readonly_fields = ('image_url',)  # URL auto-generated after save
    max_num = 10  # optional limit
    show_change_link = True


# ---------------------------
# Inventory Inline
# ---------------------------
# ---------------------------
# Inventory Inline
# ---------------------------
class InventoryInline(admin.StackedInline):
    model = Inventory
    fields = ('quantity', 'low_stock_threshold', 'is_low_stock_display', 'last_restocked_at')
    readonly_fields = ('is_low_stock_display', 'last_restocked_at')  # mark non-editable fields as readonly
    extra = 0
    max_num = 1

    def is_low_stock_display(self, obj):
        return obj.is_low_stock
    is_low_stock_display.boolean = True
    is_low_stock_display.short_description = 'Low Stock?'



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
    autocomplete_fields = ('parent_category',)

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
    list_display = ('name', 'subcategory_name', 'price', 'discounted_price', 'sku', 'is_featured', 'is_active', 'created_at')
    list_filter = ('is_featured', 'is_active')
    search_fields = ('name', 'sku', 'brand')
    ordering = ('name',)
    list_per_page = 50
    autocomplete_fields = ('subcategory',)
    inlines = [ProductImageInline, InventoryInline]  # ✅ Inline editing for images + inventory

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('subcategory', 'subcategory__parent_category').prefetch_related('images', 'inventory').only(
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
    search_fields = ('product__name',)
    ordering = ('product',)
    list_per_page = 50
    autocomplete_fields = ('product',)
    readonly_fields = ('last_restocked_at', 'is_low_stock_display')  # ✅ fix for non-editable field

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
