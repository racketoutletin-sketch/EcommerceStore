from django.urls import path
from .views import *

urlpatterns = [
    #user point of view
    path('categories/featured/', FeaturedCategoryListView.as_view(), name='featured-category-list'),
    path('subcategories/featured/', FeaturedSubCategoryListView.as_view(), name='featured-subcategory-list'),
    path('products/featured/', FeaturedProductListView.as_view(), name='featured-product-list'),

    path('products/deal-of-the-day/', DealOfTheDayProductListView.as_view(), name='deal-of-the-day-product-list'),
    path('products/exclusive/', ExclusiveProductListView.as_view(), name='exclusive-product-list'),

    path("categories/<int:pk>/subcategories/", SubCategoryListByCategoryView.as_view(), name="subcategory-list-by-category"),
    path('subcategories/<int:pk>/products/', ProductListBySubCategoryView.as_view(), name='product-list-by-subcategory'),
    path('products/view/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),

    path('products/', ProductSearchListView.as_view(), name='product-search-list'),
]
