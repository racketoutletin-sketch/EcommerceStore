from django.urls import path
from .views import (
    BannerViewSet,
    HomeCategoriesViewSet,
    HomeVideoViewSet,
    ExclusiveProductViewSet,
    FeaturedProductViewSet,
    ShopTheLookViewSet,
)

# -------------------------
# HomeCategories
# -------------------------
homecategories_list = HomeCategoriesViewSet.as_view({"get": "list"})
homecategories_detail = HomeCategoriesViewSet.as_view({"get": "retrieve"})

# -------------------------
# Banners
# -------------------------
banner_list = BannerViewSet.as_view({"get": "list"})
banner_detail = BannerViewSet.as_view({"get": "retrieve"})

# -------------------------
# HomeVideos
# -------------------------
homevideos_list = HomeVideoViewSet.as_view({"get": "list", "post": "create"})
homevideos_detail = HomeVideoViewSet.as_view({"get": "retrieve", "put": "update", "delete": "destroy"})

# -------------------------
# Exclusive Products
# -------------------------
exclusive_product_list = ExclusiveProductViewSet.as_view({"get": "list"})
exclusive_product_detail = ExclusiveProductViewSet.as_view({"get": "retrieve"})

# -------------------------
# Featured Products
# -------------------------
featured_product_list = FeaturedProductViewSet.as_view({"get": "list"})
featured_product_detail = FeaturedProductViewSet.as_view({"get": "retrieve"})

# -------------------------
# Shop The Look
# -------------------------
shop_the_look_list = ShopTheLookViewSet.as_view({"get": "list"})
shop_the_look_detail = ShopTheLookViewSet.as_view({"get": "retrieve"})


# -------------------------
# URL Patterns
# -------------------------
urlpatterns = [
    # Home Categories
    path("home-categories/", homecategories_list, name="homecategories-list"),
    path("home-categories/<int:pk>/", homecategories_detail, name="homecategories-detail"),

    # Banners
    path("banners/", banner_list, name="banner-list"),
    path("banners/<int:pk>/", banner_detail, name="banner-detail"),

    # Home Videos
    path("home-videos/", homevideos_list, name="homevideos-list"),
    path("home-videos/<int:pk>/", homevideos_detail, name="homevideos-detail"),

    # Exclusive Products
    path("exclusive-products/", exclusive_product_list, name="exclusive-product-list"),
    path("exclusive-products/<int:pk>/", exclusive_product_detail, name="exclusive-product-detail"),

    # Featured Products
    path("featured-products/", featured_product_list, name="featured-product-list"),
    path("featured-products/<int:pk>/", featured_product_detail, name="featured-product-detail"),

    # Shop The Look
    path("shop-the-look/", shop_the_look_list, name="shop-the-look-list"),
    path("shop-the-look/<int:pk>/", shop_the_look_detail, name="shop-the-look-detail"),
]
