from django.urls import path
from .views import (
    CartView,
    CartItemView,
    CartItemDetailView,
    OrderListCreateView,
    OrderDetailView,
    ProcessPaymentView,
    PaymentView,
    RazorpayWebhookView,
    WishlistView,
    AddToWishlistView,
    RemoveFromWishlistView,
    VerifyPaymentView,
    confirm_cod,
    CancelPaymentView,
    FailPaymentView,
)

urlpatterns = [

    # Cart
    path("cart/", CartView.as_view(), name="cart-detail"),
    path("cart/items/", CartItemView.as_view(), name="cart-items"), # List all items in the cart / Add new item
    path("cart/items/<int:pk>/", CartItemDetailView.as_view(), name="cart-item-detail"), # Single cart item operations (view, update, delete)

    path('wishlist/', WishlistView.as_view(), name='wishlist-view'),
    path('wishlist/add/', AddToWishlistView.as_view(), name='wishlist-add'),
    path('wishlist/remove/<int:product_id>/', RemoveFromWishlistView.as_view(), name='wishlist-remove'),


    # Orders
    path("orders/", OrderListCreateView.as_view(), name="order-list-create"),
    path("orders/<int:pk>/", OrderDetailView.as_view(), name="order-detail"),

    path("orders/<int:order_id>/confirm-cod/", confirm_cod, name="confirm-cod"),

    # Payments (DRF-only)
    path("orders/<int:order_id>/payment/", ProcessPaymentView.as_view(), name="process-payment"),
    path("orders/<int:order_id>/payment/verify/", VerifyPaymentView.as_view(), name="payment-verify"),

     path("orders/<int:order_id>/payment/cancel/", CancelPaymentView.as_view(), name="payment-cancel"),
     path("orders/<int:order_id>/payment/fail/", FailPaymentView.as_view(), name="payment-fail"),

    path("payments/<int:pk>/", PaymentView.as_view(), name="payment-detail"),

    # Razorpay webhook
    path("razorpay/webhook/", RazorpayWebhookView.as_view(), name="razorpay-webhook"),
]
