import random
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from faker import Faker
from products.models import Category, SubCategory, Product, ProductImage, Inventory

fake = Faker()

CATEGORY_DATA = {
    "BADMINTON": ["Rackets", "Shuttlecocks", "Shoes", "Bags", "Apparel"],
    "CRICKET": ["Bats", "Balls", "Pads & Guards", "Shoes", "Apparel"],
    "TENNIS": ["Rackets", "Balls", "Shoes", "Bags", "Apparel"],
    "PICKLEBALL": ["Paddles", "Balls", "Shoes", "Bags", "Apparel"],
    "FITNESS": ["Dumbbells", "Yoga Mats", "Resistance Bands", "Shoes", "Apparel"],
    "NUTRITION": ["Protein", "Vitamins", "Supplements", "Snacks", "Drinks"],
    "LIFE STYLE": ["Bags", "Watches", "Sunglasses", "Apparel", "Footwear"],
    "RUNNING SHOES": ["Men", "Women", "Kids", "Trail", "Marathon"],
    "OTHERS": ["Accessories", "Gadgets", "Apparel", "Shoes", "Equipment"],
}

BRANDS = ["Yonex", "Adidas", "Nike", "Puma", "Reebok", "Li-Ning", "Wilson", "Head", "PowerPlay"]

class Command(BaseCommand):
    help = "Seed realistic sports store database with categories, subcategories, products, images, and inventory"

    def handle(self, *args, **kwargs):
        # Clear existing data
        ProductImage.objects.all().delete()
        Product.objects.all().delete()
        SubCategory.objects.all().delete()
        Category.objects.all().delete()

        for cat_name, sub_list in CATEGORY_DATA.items():
            category = Category.objects.create(
                name=cat_name,
                description=f"{cat_name} products",
                is_active=True,
                is_featured=random.choice([True, False])
            )
            self.stdout.write(f"Created Category: {category.name}")

            for sub_name in sub_list:
                subcat = SubCategory.objects.create(
                    name=f"{cat_name} {sub_name}",
                    parent_category=category,
                    description=f"{sub_name} for {cat_name}",
                    is_active=True,
                    is_featured=random.choice([True, False])
                )
                self.stdout.write(f"  Created SubCategory: {subcat.name}")

                # Create 10 products per subcategory
                for k in range(1, 11):
                    prod_name = f"{subcat.name} {k}"
                    brand = random.choice(BRANDS)

                    price = random.randint(50, 500)
                    discounted_price = None

                    # ~50% chance to apply discount
                    if random.choice([True, False]):
                        discount = random.randint(5, int(price * 0.3))  # discount max 30% of price
                        discounted_price = price - discount

                    product = Product.objects.create(
                        name=prod_name,
                        description=f"High-quality {prod_name} by {brand}",
                        subcategory=subcat,
                        price=price,
                        discounted_price=discounted_price,
                        sku=f"{cat_name[:3]}-{sub_name[:3]}-{k}",
                        brand=brand,
                        weight=random.randint(1, 10),
                        dimensions=f"{random.randint(5,50)}x{random.randint(5,50)}x{random.randint(5,50)} cm",
                        material=fake.word(),
                        is_active=True,
                        is_featured=random.choice([True, False])
                    )

                    # Inventory
                    Inventory.objects.create(
                        product=product,
                        quantity=random.randint(10, 100),
                        low_stock_threshold=10
                    )

                    # Main Image
                    main_image_content = ContentFile(fake.image_url().encode(), name=f"{prod_name}-main.jpg")
                    product.main_image.save(f"{prod_name}-main.jpg", main_image_content)
                    product.save()

                    # 2-3 Product Images
                    for img_num in range(1, random.randint(3, 4)):
                        img_content = ContentFile(fake.image_url().encode(), name=f"{prod_name}-{img_num}.jpg")
                        ProductImage.objects.create(
                            product=product,
                            image=img_content,
                            alt_text=f"{prod_name} image {img_num}",
                            is_primary=(img_num == 1)
                        )

                    self.stdout.write(f"    Created Product: {product.name} with images")

        self.stdout.write(self.style.SUCCESS("✅ Realistic sports store seeding completed!"))
