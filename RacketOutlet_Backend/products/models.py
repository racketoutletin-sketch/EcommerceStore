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
    name = models.CharField(max_length=100, unique=True, db_index=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True, db_index=True)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(
       storage=SupabaseStorage, upload_to="category_images/",
        blank=True, null=True
    )
    image_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True, db_index=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Categories'
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['slug']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_featured']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

        # Update image URL after save
        if self.image:
            new_url = self.image.storage.url(self.image.name)
            if self.image_url != new_url:
                self.image_url = new_url
                super().save(update_fields=["image_url"])

    def __str__(self):
        return self.name


# -------------------------------
# SubCategory Model
# -------------------------------
class SubCategory(models.Model):
    name = models.CharField(max_length=100, db_index=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True, db_index=True)
    parent_category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name='subcategories', db_index=True
    )
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(
       storage=SupabaseStorage, upload_to="subcategory_images/",
        blank=True, null=True
    )
    image_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True, db_index=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('name', 'parent_category')
        ordering = ['name']
        verbose_name_plural = 'Subcategories'
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['slug']),
            models.Index(fields=['parent_category']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_featured']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.parent_category.name}-{self.name}")
        super().save(*args, **kwargs)

        if self.image:
            new_url = self.image.storage.url(self.image.name)
            if self.image_url != new_url:
                self.image_url = new_url
                super().save(update_fields=["image_url"])

    def __str__(self):
        return f"{self.parent_category.name} -> {self.name}"


# -------------------------------
# Product Model
# -------------------------------
class Product(models.Model):
    name = models.CharField(max_length=200, db_index=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True, null=True, db_index=True)
    description = models.TextField()
    subcategory = models.ForeignKey(
        SubCategory, on_delete=models.CASCADE, related_name='products', db_index=True
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], db_index=True)
    discounted_price = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(0)], db_index=True
    )
    sku = models.CharField(max_length=100, unique=True, db_index=True)
    brand = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    weight = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(0)]
    )
    dimensions = models.CharField(max_length=100, blank=True, null=True)
    material = models.CharField(max_length=100, blank=True, null=True)

    main_image = models.ImageField(
       storage=SupabaseStorage, upload_to="product_main_images/",
        blank=True, null=True
    )
    main_image_url = models.URLField(blank=True, null=True)

    extra_attributes = models.JSONField(blank=True, null=True)

    is_featured = models.BooleanField(default=False, db_index=True)
    is_deal_of_the_day = models.BooleanField(default=False, db_index=True)
    is_exclusive_product = models.BooleanField(default=False, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['slug']),
            models.Index(fields=['sku']),
            models.Index(fields=['brand']),
            models.Index(fields=['subcategory']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_featured']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.subcategory.parent_category.name}-{self.subcategory.name}-{self.name}")
        super().save(*args, **kwargs)

        if self.main_image:
            new_url = self.main_image.storage.url(self.main_image.name)
            if self.main_image_url != new_url:
                self.main_image_url = new_url
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
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images', db_index=True)
    image = models.ImageField(
       storage=SupabaseStorage, upload_to="product_images/"
    )
    image_url = models.URLField(blank=True, null=True)
    alt_text = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    is_primary = models.BooleanField(default=False, db_index=True)

    class Meta:
        ordering = ['-is_primary', 'id']
        indexes = [
            models.Index(fields=['product']),
            models.Index(fields=['is_primary']),
        ]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.image:
            new_url = self.image.storage.url(self.image.name)
            if self.image_url != new_url:
                self.image_url = new_url
                super().save(update_fields=["image_url"])

    def __str__(self):
        return f"{self.product.name} Image"


# -------------------------------
# Inventory Model
# -------------------------------
class Inventory(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='inventory', db_index=True)
    quantity = models.PositiveIntegerField(default=0, db_index=True)
    low_stock_threshold = models.PositiveIntegerField(default=10, db_index=True)
    last_restocked_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        verbose_name_plural = 'Inventories'
        indexes = [
            models.Index(fields=['product']),
            models.Index(fields=['quantity']),
            models.Index(fields=['low_stock_threshold']),
        ]

    def __str__(self):
        return f"{self.product.name} - {self.quantity} in stock"

    @property
    def is_low_stock(self):
        return self.quantity <= self.low_stock_threshold
