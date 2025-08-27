from django.db import models

class Banner(models.Model):
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, blank=True, null=True)
    image = models.ImageField(upload_to="banners/")

    subcategory = models.ForeignKey(
        "products.SubCategory",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="banners"
    )
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="banners"
    )

    created_at = models.DateTimeField(auto_now_add=True)  # ✅ needed for ordering

    def __str__(self):
        return self.title

class HomeCategories(models.Model):
    subcategory = models.ForeignKey(
        "products.SubCategory",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="home_categories"
    )
    created_at = models.DateTimeField(auto_now_add=True)  # ✅ ordering

    def __str__(self):
        return self.subcategory.name if self.subcategory else "Unnamed HomeCategory"
    
from django.db import models

from django.db import models

class HomeVideo(models.Model):
    video = models.FileField(upload_to="videos/", null=True, blank=True)  # optional file upload
    video_url = models.URLField(null=True, blank=True)  # optional video link
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Video {self.id}"



class ExclusiveProduct(models.Model):
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="exclusive_products"
    )
    created_at = models.DateTimeField(auto_now_add=True)  # ✅ for ordering

    def __str__(self):
        return self.product.name if self.product else "Unnamed Exclusive Product"

class FeaturedProduct(models.Model):
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="Featured_Product"
    )
    created_at = models.DateTimeField(auto_now_add=True)  # ✅ for ordering

    def __str__(self):
        return self.product.name if self.product else "Unnamed Exclusive Product"

from products.models import Product

class ShopTheLook(models.Model):
    title = models.CharField(max_length=200, default="Shop the Look")
    player_image = models.ImageField(upload_to="shop_look/")  # lee.jpg like player image

    def __str__(self):
        return self.title


class Hotspot(models.Model):
    shop_the_look = models.ForeignKey(
        ShopTheLook, related_name="hotspots", on_delete=models.CASCADE
    )
    product = models.ForeignKey(Product, related_name="hotspots", on_delete=models.CASCADE)
    top = models.PositiveIntegerField()   # CSS top position (px)
    left = models.PositiveIntegerField(null=True, blank=True)   # CSS left position (px)
    right = models.PositiveIntegerField(null=True, blank=True)  # CSS right position (px)

    def __str__(self):
        return f"{self.product.name} hotspot in {self.shop_the_look.title}"