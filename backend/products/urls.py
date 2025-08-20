# products/urls.py
from django.urls import path
from .views import (
    CategoryListCreateView,
    CategoryDetailView,
    ProductListCreateView,
    ProductDetailView,
    ProductImageView,
    InventoryView,
    BulkProductUploadView
)

urlpatterns = [
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
    path('products/', ProductListCreateView.as_view(), name='product-list-create'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('products/<int:product_id>/images/', ProductImageView.as_view(), name='product-images'),
    path('products/<int:product_id>/inventory/', InventoryView.as_view(), name='product-inventory'),
    path('products/bulk-upload/', BulkProductUploadView.as_view(), name='bulk-product-upload'),
]