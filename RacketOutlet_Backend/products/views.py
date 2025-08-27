from rest_framework import generics, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, SubCategory, Product
from .serializers import *

# -------------------------------
# Featured Categories
# -------------------------------
class FeaturedCategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True, is_featured=True)
    serializer_class = FeaturedCategorySerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

# -------------------------------
# Featured SubCategories
# -------------------------------
class FeaturedSubCategoryListView(generics.ListAPIView):
    queryset = SubCategory.objects.filter(is_active=True, is_featured=True)
    serializer_class = FeaturedSubCategorySerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'description']

# -------------------------------
# SubCategories by Category
# -------------------------------
class SubCategoryListByCategoryView(generics.ListAPIView):
    serializer_class = SubCategorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        category_id = self.kwargs["pk"]
        return SubCategory.objects.filter(parent_category_id=category_id, is_active=True)



# -------------------------------
# Featured Products
# -------------------------------
class FeaturedProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True, is_featured=True)
    serializer_class = FeaturedProductSerializer
    permission_classes = [AllowAny]

# -------------------------------
# Deal of the Day Products
# -------------------------------
class DealOfTheDayProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True, is_deal_of_the_day=True)
    serializer_class = ProductStatusSerializer
    permission_classes = [AllowAny]

# -------------------------------
# Exclusive Products
# -------------------------------
class ExclusiveProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True, is_exclusive_product=True)
    serializer_class = ProductStatusSerializer
    permission_classes = [AllowAny]

# -------------------------------
# Products by SubCategory
# -------------------------------

from django.db.models import Case, When, F, DecimalField
from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import AllowAny
from .models import Product
from .serializers import ProductSerializer

class ProductListBySubCategoryView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'sku', 'brand']

    def get_queryset(self):
        subcat_id = self.kwargs.get('pk')
        qs = Product.objects.filter(is_active=True, subcategory_id=subcat_id)

        # --- Annotate current_price for filtering & sorting ---
        qs = qs.annotate(
            db_current_price=Case(
                When(discounted_price__isnull=False, then=F('discounted_price')),
                default=F('price'),
                output_field=DecimalField()
            )
        )


        # --- Filters ---
        min_price = self.request.query_params.get('price_min')
        max_price = self.request.query_params.get('price_max')
        brand = self.request.query_params.get('brand')
        product_type = self.request.query_params.get('productType')
        in_stock = self.request.query_params.get('inStock')

        if min_price:
            qs = qs.filter(db_current_price__gte=min_price)
        if max_price:
            qs = qs.filter(db_current_price__lte=max_price)
        if brand:
            qs = qs.filter(brand__iexact=brand)
        if product_type:
            qs = qs.filter(subcategory__name__iexact=product_type)
        if in_stock and in_stock.lower() == "true":
            qs = qs.filter(inventory__quantity__gt=0)

        # --- Sorting ---
        sort = self.request.query_params.get('sort')
        # Sorting
        if sort == "price_asc":
            qs = qs.order_by("db_current_price")
        elif sort == "price_desc":
            qs = qs.order_by("-db_current_price")
        elif sort == "name_asc":
            qs = qs.order_by("name")
        elif sort == "name_desc":
            qs = qs.order_by("-name")
        elif sort == "date_asc":
            qs = qs.order_by("created_at")
        elif sort == "date_desc":
            qs = qs.order_by("-created_at")
        elif sort == "featured":
            qs = qs.order_by("-is_featured")
        elif sort == "best_selling":
            qs = qs.order_by("-sales_count") if hasattr(Product, "sales_count") else qs

        return qs




# -------------------------------
# Product Detail
# -------------------------------
class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'pk'


# ---------------------
# ProductSearchListView
# ---------------------
from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import AllowAny

from .models import Product
from .serializers import ProductSerializer
from common.pagination import StandardResultsSetPagination


from django.db.models import F, Case, When

class ProductSearchListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [
        filters.SearchFilter,
        DjangoFilterBackend,
        filters.OrderingFilter,
    ]
    search_fields = ['name', 'sku', 'brand']
    filterset_fields = ['is_featured', 'is_deal_of_the_day', 'brand']

    ordering_fields = ['price', 'name', 'created_at', 'current_price_value']

    ordering = ['-created_at']

    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = super().get_queryset()

        # Add "current_price" as an annotated DB field
        qs = qs.annotate(
            current_price_value=Case(
                When(discounted_price__isnull=False, then=F("discounted_price")),
                default=F("price"),
            )
        )

        # Price range filtering
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            qs = qs.filter(current_price__gte=min_price)
        if max_price:
            qs = qs.filter(current_price__lte=max_price)

        # Type filter
        sub_category_name = self.request.query_params.get('type')
        if sub_category_name:
            qs = qs.filter(subcategory__name__iexact=sub_category_name)

        return qs
