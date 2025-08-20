# products/management/commands/seed_products.py
import random
import string
from django.core.management.base import BaseCommand
from products.models import Category, Product, Inventory

class Command(BaseCommand):
    help = "Seed database with badminton categories and products"

    def handle(self, *args, **kwargs):
        categories = [
            "Badminton Rackets",
            "Shuttlecocks",
            "Badminton Shoes",
            "Grips",
            "Badminton Bags",
            "Apparel",
            "Strings",
            "Nets",
            "Accessories",
            "Training Equipment"
        ]

        for cat_name in categories:
            category, _ = Category.objects.get_or_create(name=cat_name)

            for i in range(1, 11):  # 10 products each
                # Generate a unique SKU like BAD-<CAT>-<i>-<rand>
                rand_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
                sku = f"{cat_name[:3].upper()}-{i:03d}-{rand_suffix}"

                product, created = Product.objects.get_or_create(
                    name=f"{cat_name} Product {i}",
                    defaults={
                        "description": f"High quality {cat_name} product {i}.",
                        "category": category,
                        "price": random.randint(500, 5000),
                        "discounted_price": random.randint(300, 4000),
                        "sku": sku,
                        "brand": "Yonex",
                        "weight": 85,
                        "dimensions": "68cm",
                        "material": "Carbon Fiber",
                        "is_featured": (i % 2 == 0),
                        "is_active": True,
                    }
                )

                if created:
                    Inventory.objects.create(product=product, quantity=random.randint(10, 100))

        self.stdout.write(self.style.SUCCESS("✅ Seeded categories and products successfully"))
