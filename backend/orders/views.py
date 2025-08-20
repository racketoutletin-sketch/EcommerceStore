# orders/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from .models import Cart, CartItem, Order, OrderItem, Payment
from .serializers import (
    CartSerializer, 
    CartItemSerializer, 
    OrderSerializer, 
    CreateOrderSerializer,
    PaymentSerializer
)
import uuid
from django.core.cache import cache

class CartView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        cache_key = f"cart:{user.id}"
        
        # Try to get cart from cache
        cart = cache.get(cache_key)
        if cart is None:
            cart, created = Cart.objects.get_or_create(user=user)
            cache.set(cache_key, cart, timeout=60*30)  # Cache for 30 minutes
        
        return cart

class CartItemView(generics.ListCreateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return CartItem.objects.filter(cart=cart)
    
    def perform_create(self, serializer):
        user = self.request.user
        cache_key = f"cart:{user.id}"
        
        # Get cart from cache or create if not exists
        cart = cache.get(cache_key)
        if cart is None:
            cart, created = Cart.objects.get_or_create(user=user)
            cache.set(cache_key, cart, timeout=60*30)
        
        serializer.save(cart=cart)
        
        # Invalidate cart cache
        cache.delete(cache_key)

class CartItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return CartItem.objects.filter(cart=cart)

class OrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateOrderSerializer
        return OrderSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Order.objects.all()
        return Order.objects.filter(user=user)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        
        # Generate order number
        order.order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        order.save()
        
        # Create payment record
        Payment.objects.create(
            order=order,
            amount=order.total_amount,
            payment_method=order.payment_method
        )
        
        # Send notification about order creation
        from notifications.services import send_order_confirmation_email
        send_order_confirmation_email(order)
        
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

class OrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Order.objects.all()
        return Order.objects.filter(user=user)

class PaymentView(generics.RetrieveUpdateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Payment.objects.all()
        return Payment.objects.filter(order__user=user)

class ProcessPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if order.payment_status != 'pending':
            return Response({"error": "Payment already processed"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Here you would integrate with Razorpay/Stripe
        # For brevity, we'll just simulate a successful payment
        payment = order.payment
        payment.status = 'completed'
        payment.transaction_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
        payment.save()
        
        order.payment_status = 'completed'
        order.status = 'confirmed'
        order.save()
        
        # Send notification about payment completion
        from notifications.services import send_payment_confirmation_email
        send_payment_confirmation_email(order)
        
        return Response(PaymentSerializer(payment).data, status=status.HTTP_200_OK)