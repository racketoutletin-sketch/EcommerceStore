from rest_framework import generics, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Case, When, F, DecimalField
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, SubCategory, Product
from .serializers import (
    # FeaturedCategorySerializer, 
    FeaturedSubCategorySerializer,
    SubCategorySerializer, CategorySerializer,
    FeaturedProductSerializer, ProductStatusSerializer, ProductSerializer
)
from common.pagination import StandardResultsSetPagination


# -------------------------------
# Featured Categories
# -------------------------------
# class FeaturedCategoryListView(generics.ListAPIView):
#     queryset = Category.objects.filter(is_active=True, is_featured=True)
#     serializer_class = FeaturedCategorySerializer
#     permission_classes = [AllowAny]
#     filter_backends = [filters.SearchFilter]
#     search_fields = ['name', 'description']


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
        return SubCategory.objects.filter(
            parent_category_id=category_id,
            is_active=True
        ).select_related('parent_category')


# -------------------------------
# Featured Products
# -------------------------------
class FeaturedProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True, is_featured=True).select_related('subcategory', 'subcategory__parent_category')
    serializer_class = FeaturedProductSerializer
    permission_classes = [AllowAny]


# -------------------------------
# Deal of the Day Products
# -------------------------------
class DealOfTheDayProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True, is_deal_of_the_day=True).select_related('subcategory', 'subcategory__parent_category')
    serializer_class = ProductStatusSerializer
    permission_classes = [AllowAny]


# -------------------------------
# Exclusive Products
# -------------------------------
class ExclusiveProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True, is_exclusive_product=True).select_related('subcategory', 'subcategory__parent_category')
    serializer_class = ProductStatusSerializer
    permission_classes = [AllowAny]


# -------------------------------
# Products by SubCategory
# -------------------------------
class ProductListBySubCategoryView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['name', 'sku', 'brand']
    ordering_fields = ['price', 'name', 'created_at', 'discounted_price']
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        subcat_id = self.kwargs.get('pk')
        qs = Product.objects.filter(is_active=True, subcategory_id=subcat_id).select_related('subcategory', 'subcategory__parent_category').prefetch_related('images', 'inventory')

        # Annotate current price
        qs = qs.annotate(
            db_current_price=Case(
                When(discounted_price__isnull=False, then=F('discounted_price')),
                default=F('price'),
                output_field=DecimalField()
            )
        )

        # Filters
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

        # Sorting
        sort = self.request.query_params.get('sort')
        sort_mapping = {
            'price_asc': 'db_current_price',
            'price_desc': '-db_current_price',
            'name_asc': 'name',
            'name_desc': '-name',
            'date_asc': 'created_at',
            'date_desc': '-created_at',
            'featured': '-is_featured',
        }
        if sort in sort_mapping:
            qs = qs.order_by(sort_mapping[sort])

        return qs


# -------------------------------
# Product Detail
# -------------------------------
class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True).select_related('subcategory', 'subcategory__parent_category').prefetch_related('images', 'inventory')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


# -------------------------------
# Product Search
# -------------------------------
class ProductSearchListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['name', 'sku', 'brand']
    filterset_fields = ['is_featured', 'is_deal_of_the_day', 'brand']
    ordering_fields = ['price', 'name', 'created_at', 'discounted_price']
    ordering = ['-created_at']
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True).select_related('subcategory', 'subcategory__parent_category').prefetch_related('images', 'inventory')
        # Annotate current price
        qs = qs.annotate(
            db_current_price=Case(
                When(discounted_price__isnull=False, then=F("discounted_price")),
                default=F("price"),
                output_field=DecimalField()
            )
        )
        # Filters
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        sub_category_name = self.request.query_params.get('type')
        if min_price:
            qs = qs.filter(db_current_price__gte=min_price)
        if max_price:
            qs = qs.filter(db_current_price__lte=max_price)
        if sub_category_name:
            qs = qs.filter(subcategory__name__iexact=sub_category_name)
        return qs

class BrandListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        # Only active products, non-null brands
        brands = (
            Product.objects.filter(is_active=True)
            .exclude(brand__isnull=True)
            .exclude(brand__exact="")
            .values_list("brand", flat=True)
            .distinct()
            .order_by("brand")
        )
        return Response({"brands": list(brands)})