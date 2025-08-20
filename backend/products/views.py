# products/views.py
from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Category, Product, ProductImage, Inventory
from .serializers import (
    CategorySerializer, 
    ProductSerializer, 
    ProductListSerializer,
    ProductImageSerializer,
    InventorySerializer
)
from common.pagination import StandardResultsSetPagination


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.filter(parent=None, is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'brand', 'is_featured']
    search_fields = ['name', 'description', 'brand', 'sku']
    ordering_fields = ['price', 'created_at', 'name']
    pagination_class = StandardResultsSetPagination
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ProductListSerializer
        return ProductSerializer

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class ProductImageView(generics.ListCreateAPIView):
    serializer_class = ProductImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        return ProductImage.objects.filter(product_id=product_id)
    
    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_id')
        product = Product.objects.get(id=product_id)
        serializer.save(product=product)

class InventoryView(generics.RetrieveUpdateAPIView):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_object(self):
        product_id = self.kwargs.get('product_id')
        return Inventory.objects.get(product_id=product_id)

class BulkProductUploadView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request):
        # Implementation for bulk product upload via CSV/Excel
        # This would involve parsing the uploaded file and creating products
        return Response({"message": "Bulk product upload endpoint"}, status=status.HTTP_200_OK)