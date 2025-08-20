# products/management/commands/seed_product_images.py
from django.core.management.base import BaseCommand
from products.models import Product, ProductImage
import random

class Command(BaseCommand):
    help = "Seed ProductImage table with placeholder URLs"

    def handle(self, *args, **kwargs):
        products = Product.objects.all()

        if not products.exists():
            self.stdout.write(self.style.ERROR("⚠️ No products found. Add products first."))
            return

        for product in products:
            # Generate 3 placeholder images per product
            for i in range(3):
                img_url = f"https://via.placeholder.com/300?text={product.name}+{i+1}"
                ProductImage.objects.get_or_create(
                    product=product,
                    image_url=img_url,
                    defaults={"alt_text": f"{product.name} image {i+1}"}
                )
            self.stdout.write(self.style.SUCCESS(f"✅ Added placeholder images for {product.name}"))

        self.stdout.write(self.style.SUCCESS("🎉 Product images seeded successfully!"))
