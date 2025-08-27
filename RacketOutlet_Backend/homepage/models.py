from django.db import models
from products.models import Product
from common.supabase_storage_backend import SupabaseStorage

def get_supabase_storage():
    return SupabaseStorage()

# -------------------------
# Banner Model
# -------------------------
class Banner(models.Model):
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, blank=True, null=True)
    image = models.ImageField(storage=SupabaseStorage, upload_to="banners/")

    subcategory = models.ForeignKey(
        "products.SubCategory",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="banners"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="banners"
    )

    created_at = models.DateTimeField(auto_now_add=True)  # For ordering

    def delete(self, *args, **kwargs):
        """Ensure file is deleted from Supabase before DB record is removed."""
        if self.image and self.image.name:
            self.image.storage.delete(self.image.name)
        super().delete(*args, **kwargs)

    def __str__(self):
        return self.title


# -------------------------
# HomeCategories Model
# -------------------------
class HomeCategories(models.Model):
    subcategory = models.ForeignKey(
        "products.SubCategory",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="home_categories"
    )
    created_at = models.DateTimeField(auto_now_add=True)  # For ordering

    def __str__(self):
        return self.subcategory.name if self.subcategory else "Unnamed HomeCategory"


# -------------------------
# HomeVideo Model
# -------------------------
class HomeVideo(models.Model):
    video = models.FileField(
        storage=SupabaseStorage,
        upload_to="videos/",
        null=True,
        blank=True
    )
    video_url = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        """Save first, then update video_url."""
        super().save(*args, **kwargs)
        if self.video and self.video.name:
            url = self.video.storage.url(self.video.name)
            if url != self.video_url:
                self.video_url = url
                super().save(update_fields=["video_url"])

    def delete(self, *args, **kwargs):
        """Delete from Supabase first, then DB record."""
        if self.video and self.video.name:
            self.video.storage.delete(self.video.name)
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"HomeVideo {self.id}"


# -------------------------
# ExclusiveProduct Model
# -------------------------
class ExclusiveProduct(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="exclusive_products"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.product.name if self.product else "Unnamed Exclusive Product"


# -------------------------
# FeaturedProduct Model
# -------------------------
class FeaturedProduct(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="featured_products"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.product.name if self.product else "Unnamed Featured Product"


# -------------------------
# ShopTheLook Model
# -------------------------
class ShopTheLook(models.Model):
    title = models.CharField(max_length=200, default="Shop the Look")
    player_image = models.ImageField(storage=SupabaseStorage, upload_to="shop_look/")

    def delete(self, *args, **kwargs):
        """Delete player image from Supabase when record is deleted."""
        if self.player_image and self.player_image.name:
            self.player_image.storage.delete(self.player_image.name)
        super().delete(*args, **kwargs)

    def __str__(self):
        return self.title


# -------------------------
# Hotspot Model
# -------------------------
class Hotspot(models.Model):
    shop_the_look = models.ForeignKey(
        ShopTheLook,
        related_name="hotspots",
        on_delete=models.CASCADE
    )
    product = models.ForeignKey(
        Product,
        related_name="hotspots",
        on_delete=models.CASCADE
    )
    top = models.PositiveIntegerField()   # CSS top position in px
    left = models.PositiveIntegerField(null=True, blank=True)   # CSS left position in px
    right = models.PositiveIntegerField(null=True, blank=True)  # CSS right position in px

    def __str__(self):
        return f"{self.product.name} hotspot in {self.shop_the_look.title}"
