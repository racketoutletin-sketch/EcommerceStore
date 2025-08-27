from django.contrib import admin
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


# -------------------------
# Banner Admin
# -------------------------
@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "subtitle", "subcategory", "product", "created_at")
    search_fields = ("title", "subtitle")
    ordering = ("-created_at",)
    list_filter = ("created_at",)

    # Use raw_id_fields to avoid large dropdowns and cursor issues
    raw_id_fields = ("subcategory", "product")


# -------------------------
# HomeCategories Admin
# -------------------------
@admin.register(HomeCategories)
class HomeCategoriesAdmin(admin.ModelAdmin):
    list_display = ("id", "subcategory", "created_at")
    search_fields = ("subcategory__name",)
    ordering = ("-created_at",)
    list_filter = ("created_at",)
    raw_id_fields = ("subcategory",)


# -------------------------
# HomeVideo Admin
# -------------------------
@admin.register(HomeVideo)
class HomeVideoAdmin(admin.ModelAdmin):
    list_display = ("id", "video", "video_url", "created_at")
    search_fields = ("video_url",)
    list_filter = ("created_at",)

    # Delete video from storage when deleting objects
    def delete_model(self, request, obj):
        if obj.video and obj.video.name:
            obj.video.storage.delete(obj.video.name)
        obj.delete()

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            if obj.video and obj.video.name:
                obj.video.storage.delete(obj.video.name)
        queryset.delete()


# -------------------------
# ExclusiveProduct Admin
# -------------------------
@admin.register(ExclusiveProduct)
class ExclusiveProductAdmin(admin.ModelAdmin):
    list_display = ("id", "get_product_name", "created_at")
    list_filter = ("created_at",)
    search_fields = ("product__name",)
    raw_id_fields = ("product",)

    def get_product_name(self, obj):
        return obj.product.name if obj.product else "No Product"
    get_product_name.short_description = "Product"


# -------------------------
# FeaturedProduct Admin
# -------------------------
@admin.register(FeaturedProduct)
class FeaturedProductAdmin(admin.ModelAdmin):
    list_display = ("id", "get_product_name", "created_at")
    list_filter = ("created_at",)
    search_fields = ("product__name",)
    raw_id_fields = ("product",)

    def get_product_name(self, obj):
        return obj.product.name if obj.product else "No Product"
    get_product_name.short_description = "Product"


# -------------------------
# ShopTheLook & Hotspot Admin
# -------------------------
class HotspotInline(admin.TabularInline):
    model = Hotspot
    extra = 1
    readonly_fields = ("product_name", "product_image")
    raw_id_fields = ("product",)

    def product_name(self, obj):
        return obj.product.name if obj.product else "-"
    product_name.short_description = "Product Name"

    def product_image(self, obj):
        if obj.product and obj.product.main_image:
            return f'<img src="{obj.product.main_image.url}" width="50" />'
        return "-"
    product_image.allow_tags = True
    product_image.short_description = "Product Image"


@admin.register(ShopTheLook)
class ShopTheLookAdmin(admin.ModelAdmin):
    list_display = ("id", "title")
    inlines = [HotspotInline]
