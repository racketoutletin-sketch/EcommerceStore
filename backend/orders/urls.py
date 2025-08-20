# orders/urls.py
from django.urls import path
from .views import (
    CartView,
    CartItemView,
    CartItemDetailView,
    OrderListCreateView,
    OrderDetailView,
    PaymentView,
    ProcessPaymentView
)

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/items/', CartItemView.as_view(), name='cart-items'),
    path('cart/items/<int:pk>/', CartItemDetailView.as_view(), name='cart-item-detail'),
    path('orders/', OrderListCreateView.as_view(), name='order-list-create'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('orders/<int:order_id>/payment/', ProcessPaymentView.as_view(), name='process-payment'),
    path('payments/<int:pk>/', PaymentView.as_view(), name='payment-detail'),
]