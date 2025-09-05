import os
import asyncio
import aiohttp
import random
import tempfile
from pathlib import Path
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

# Temp dir for downloaded images
TEMP_DIR = tempfile.TemporaryDirectory()
PLACEHOLDER_IMAGE = Path(__file__).parent / "placeholder.jpg"  # ensure this exists


def safe_str(s: str, max_length: int = 100):
    return s[:max_length] if s else ""


async def download_image(session: aiohttp.ClientSession, seed: str, width=800, height=600, retries=3) -> Path:
    url = f"https://picsum.photos/seed/{seed}/{width}/{height}"
    local_path = Path(TEMP_DIR.name) / f"{seed}.jpg"

    for attempt in range(1, retries + 1):
        try:
            async with session.get(url) as resp:
                if resp.status == 200:
                    content = await resp.read()
                    with open(local_path, "wb") as f:
                        f.write(content)
                    return local_path
                else:
                    print(f"⚠️ Attempt {attempt} failed for {url} (status {resp.status})")
        except Exception as e:
            print(f"⚠️ Attempt {attempt} error for {url}: {e}")

        await asyncio.sleep(1)

    print(f"⚠️ Using fallback placeholder for {seed}")
    return PLACEHOLDER_IMAGE


class Command(BaseCommand):
    help = "Seed sports store with categories, subcategories, products, inventory, and images"

    def handle(self, *args, **kwargs):
        self.stdout.write("⚡ Starting seeding process...")

        # Clear old data
        ProductImage.objects.all().delete()
        Product.objects.all().delete()
        SubCategory.objects.all().delete()
        Category.objects.all().delete()
        self.stdout.write("✅ Cleared old data.")

        # Run async image downloads first
        asyncio.run(self.download_all_images())

        # ORM operations
        self.create_categories_and_products()

        # Cleanup
        TEMP_DIR.cleanup()
        self.stdout.write(self.style.SUCCESS("🎉 Seeding completed successfully!"))

    async def download_all_images(self):
        self.download_tasks = []
        self.image_paths = {}  # {name: Path}

        async with aiohttp.ClientSession() as session:
            for cat_name, sub_list in CATEGORY_DATA.items():
                self.download_tasks.append(
                    asyncio.create_task(self._download_and_store(session, cat_name))
                )

                for sub_name in sub_list:
                    subcat_name = f"{cat_name} {sub_name}"
                    self.download_tasks.append(
                        asyncio.create_task(self._download_and_store(session, subcat_name))
                    )

                    for k in range(1, 11):
                        prod_name = f"{subcat_name} {k}"
                        self.download_tasks.append(
                            asyncio.create_task(self._download_and_store(session, prod_name))
                        )
                        for img_num in range(1, 5):
                            extra_img_name = f"{prod_name}-extra-{img_num}"
                            self.download_tasks.append(
                                asyncio.create_task(self._download_and_store(session, extra_img_name))
                            )

            await asyncio.gather(*self.download_tasks)

    async def _download_and_store(self, session, name):
        path = await download_image(session, name.replace(" ", "_"))
        if path:
            self.image_paths[name] = path

    def create_categories_and_products(self):
        for cat_name, sub_list in CATEGORY_DATA.items():
            # Category
            category = Category(
                name=safe_str(cat_name, 100),
                description=safe_str(f"{cat_name} products", 200),
                is_active=True,
                is_featured=random.choice([True, False])
            )
            if cat_name in self.image_paths:
                with open(self.image_paths[cat_name], "rb") as f:
                    category.image.save(
                        f"{safe_str(cat_name,50)}.jpg",
                        ContentFile(f.read(), name=f"{safe_str(cat_name,50)}.jpg")
                    )
            category.save()
            self.stdout.write(f"✅ Created Category: {category.name}")

            # Subcategories
            for sub_name in sub_list:
                subcat_name = f"{cat_name} {sub_name}"
                subcat = SubCategory(
                    name=safe_str(sub_name, 100),
                    parent_category=category,
                    description=safe_str(f"{sub_name} for {cat_name}", 200),
                    is_active=True,
                    is_featured=random.choice([True, False])
                )
                if subcat_name in self.image_paths:
                    with open(self.image_paths[subcat_name], "rb") as f:
                        subcat.image.save(
                            f"{safe_str(subcat_name,50)}.jpg",
                            ContentFile(f.read(), name=f"{safe_str(subcat_name,50)}.jpg")
                        )
                subcat.save()
                self.stdout.write(f"  📂 Created SubCategory: {subcat.name}")

                # Products
                for k in range(1, 11):
                    prod_name = f"{subcat_name} {k}"
                    brand = random.choice(BRANDS)
                    price = random.randint(50, 500)
                    discounted_price = price - random.randint(5, int(price * 0.3)) if random.choice([True, False]) else None

                    product = Product(
                        name=safe_str(prod_name, 100),
                        description=safe_str(f"High-quality {prod_name} by {brand}", 200),
                        subcategory=subcat,
                        price=price,
                        discounted_price=discounted_price,
                        sku=safe_str(f"{cat_name[:3]}-{sub_name[:3]}-{k}", 50),
                        brand=safe_str(brand, 50),
                        weight=random.randint(1, 10),
                        dimensions=safe_str(f"{random.randint(5,50)}x{random.randint(5,50)}x{random.randint(5,50)} cm", 50),
                        material=safe_str(fake.word(), 50),
                        is_active=True,
                        is_featured=random.choice([True, False])
                    )
                    if prod_name in self.image_paths:
                        with open(self.image_paths[prod_name], "rb") as f:
                            product.main_image.save(
                                f"{safe_str(prod_name,50)}.jpg",
                                ContentFile(f.read(), name=f"{safe_str(prod_name,50)}.jpg")
                            )
                    product.save()

                    # Inventory
                    Inventory.objects.create(
                        product=product,
                        quantity=random.randint(10, 100),
                        low_stock_threshold=10
                    )

                    # Extra images
                    for img_num in range(1, 5):
                        extra_img_name = f"{prod_name}-extra-{img_num}"
                        if extra_img_name in self.image_paths:
                            with open(self.image_paths[extra_img_name], "rb") as f:
                                ProductImage.objects.create(
                                    product=product,
                                    image=ContentFile(f.read(), name=f"{safe_str(extra_img_name,50)}.jpg"),
                                    alt_text=safe_str(f"{prod_name} image {img_num}", 100),
                                    is_primary=False
                                )

                    self.stdout.write(f"    🛒 Created Product: {product.name} with extra images")
