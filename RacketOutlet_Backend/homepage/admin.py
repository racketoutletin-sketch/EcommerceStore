from django.contrib import admin
from .models import Banner

@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "subtitle", "subcategory", "product", "created_at")
    search_fields = ("title", "subtitle")
    ordering = ("-created_at",)
    list_filter = ("created_at",)


# home/admin.py
from django.contrib import admin
from .models import HomeCategories


@admin.register(HomeCategories)
class HomeCategoriesAdmin(admin.ModelAdmin):
    list_display = ("id", "subcategory", "created_at")   # show in list view
    search_fields = ("subcategory__name",)              # search by subcategory name
    ordering = ("-created_at",)                         # latest first
    list_filter = ("created_at",)                       # sidebar filter


from django.contrib import admin
from .models import HomeVideo

@admin.register(HomeVideo)
class HomeVideoAdmin(admin.ModelAdmin):
    list_display = ("id", "video", "video_url", "created_at")
    search_fields = ("video_url",)
    list_filter = ("created_at",)


from django.contrib import admin
from .models import ExclusiveProduct, FeaturedProduct


@admin.register(ExclusiveProduct)
class ExclusiveProductAdmin(admin.ModelAdmin):
    list_display = ("id", "get_product_name", "created_at")
    list_filter = ("created_at",)
    search_fields = ("product__name",)

    def get_product_name(self, obj):
        return obj.product.name if obj.product else "No Product"
    get_product_name.short_description = "Product"

    # Optional: Show product image thumbnail if available
    def product_image(self, obj):
        if obj.product and hasattr(obj.product, "image") and obj.product.image:
            return f"<img src='{obj.product.image.url}' width='60' height='60' style='object-fit:contain;'/>"
        return "No Image"
    product_image.allow_tags = True
    product_image.short_description = "Image"


@admin.register(FeaturedProduct)
class FeaturedProductAdmin(admin.ModelAdmin):
    list_display = ("id", "get_product_name", "created_at")
    list_filter = ("created_at",)
    search_fields = ("product__name",)

    def get_product_name(self, obj):
        return obj.product.name if obj.product else "No Product"
    get_product_name.short_description = "Product"

    # Optional: Show product image thumbnail if available
    def product_image(self, obj):
        if obj.product and hasattr(obj.product, "image") and obj.product.image:
            return f"<img src='{obj.product.image.url}' width='60' height='60' style='object-fit:contain;'/>"
        return "No Image"
    product_image.allow_tags = True
    product_image.short_description = "Image"


from django.contrib import admin
from .models import Product, ShopTheLook, Hotspot



from django.contrib import admin
from .models import ShopTheLook, Hotspot
from products.models import Product  # for FK

class HotspotInline(admin.TabularInline):
    model = Hotspot
    extra = 1
    readonly_fields = ("product_name", "product_image")  # show product info inline

    # Display product name and image in the inline
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
    inlines = [HotspotInline]  # include hotspots inline
