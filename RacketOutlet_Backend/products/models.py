import uuid
from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator
from common.supabase_storage_backend import SupabaseStorage


def get_supabase_storage():
    return SupabaseStorage()

# -------------------------------
# Category Model
# -------------------------------
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(storage=SupabaseStorage, upload_to="category_images/", blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_featured = models.BooleanField(default=False)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

        # Auto-populate Supabase public URL
        if self.image and not self.image_url:
            self.image_url = SupabaseStorage.url(self.image.name)
            super().save(update_fields=["image_url"])

    def __str__(self):
        return self.name


# -------------------------------
# SubCategory Model
# -------------------------------
class SubCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    parent_category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories')
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(storage=SupabaseStorage, upload_to="subcategory_images/", blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('name', 'parent_category')
        ordering = ['name']
        verbose_name_plural = 'Subcategories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.parent_category.name}-{self.name}")
        super().save(*args, **kwargs)

        if self.image and not self.image_url:
            self.image_url = SupabaseStorage.url(self.image.name)
            super().save(update_fields=["image_url"])

    def __str__(self):
        return f"{self.parent_category.name} -> {self.name}"


# -------------------------------
# Product Model
# -------------------------------
class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=255, unique=True, blank=True, null=True)
    description = models.TextField()
    subcategory = models.ForeignKey(SubCategory, on_delete=models.CASCADE, related_name='products')
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    discounted_price = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(0)]
    )
    sku = models.CharField(max_length=100, unique=True)
    brand = models.CharField(max_length=100, blank=True, null=True)
    weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(0)])
    dimensions = models.CharField(max_length=100, blank=True, null=True)
    material = models.CharField(max_length=100, blank=True, null=True)

    # Primary image for quick access
    main_image = models.ImageField(storage=SupabaseStorage, upload_to="product_main_images/", blank=True, null=True)
    main_image_url = models.URLField(blank=True, null=True)

    # Dynamic attributes
    extra_attributes = models.JSONField(blank=True, null=True, help_text="Store dynamic product attributes as JSON")

    # Flags
    is_featured = models.BooleanField(default=False)
    is_deal_of_the_day = models.BooleanField(default=False)
    is_exclusive_product = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.subcategory.parent_category.name}-{self.subcategory.name}-{self.name}")
        super().save(*args, **kwargs)

        if self.main_image and not self.main_image_url:
            self.main_image_url = SupabaseStorage.url(self.main_image.name)
            super().save(update_fields=["main_image_url"])

    def __str__(self):
        return f"{self.subcategory.name} -> {self.name}" + (f" ({self.brand})" if self.brand else "")

    @property
    def current_price(self):
        return self.discounted_price if self.discounted_price else self.price


# -------------------------------
# Product Image Model
# -------------------------------
class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(storage=SupabaseStorage, upload_to="product_images/")
    image_url = models.URLField(blank=True, null=True)
    alt_text = models.CharField(max_length=255, blank=True, null=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        ordering = ['-is_primary', 'id']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if self.image and not self.image_url:
            self.image_url = SupabaseStorage.url(self.image.name)
            super().save(update_fields=["image_url"])

    def __str__(self):
        return f"{self.product.name} Image"


# -------------------------------
# Inventory Model
# -------------------------------
class Inventory(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='inventory')
    quantity = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=10)
    last_restocked_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Inventories'

    def __str__(self):
        return f"{self.product.name} - {self.quantity} in stock"

    @property
    def is_low_stock(self):
        return self.quantity <= self.low_stock_threshold
