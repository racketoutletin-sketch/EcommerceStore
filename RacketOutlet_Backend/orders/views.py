import json
import hmac
import hashlib
import os
import uuid

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt

from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.core.cache import cache

from .models import Cart, CartItem, Order, OrderItem, Payment
from .serializers import (
    CartSerializer,
    CartItemSerializer,
    OrderSerializer,
    CreateOrderSerializer,
    PaymentSerializer
)
from common.razorpay_client import razorpay_client
import razorpay
from dotenv import load_dotenv

load_dotenv()


# orders/views.py
import razorpay
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .models import Payment, Order

class RazorpayWebhookView(APIView):
    permission_classes = [AllowAny]  # Webhooks are external calls, no auth

    @csrf_exempt
    def post(self, request, *args, **kwargs):
        data = request.data
        event = data.get("event")

        if event == "payment.captured":
            payment_id = data["payload"]["payment"]["entity"]["id"]
            order_id = data["payload"]["payment"]["entity"].get("notes", {}).get("order_id")

            try:
                payment = Payment.objects.get(razorpay_payment_id=payment_id)
            except Payment.DoesNotExist:
                return JsonResponse({"error": "Payment not found"}, status=404)

            payment.status = "captured"
            payment.save()

            if order_id:
                try:
                    order = Order.objects.get(id=order_id)
                    order.status = "paid"
                    order.save()
                except Order.DoesNotExist:
                    pass

            return JsonResponse({"status": "payment captured processed"})

        elif event == "payment.failed":
            payment_id = data["payload"]["payment"]["entity"]["id"]

            try:
                payment = Payment.objects.get(razorpay_payment_id=payment_id)
            except Payment.DoesNotExist:
                return JsonResponse({"error": "Payment not found"}, status=404)

            payment.status = "failed"
            payment.save()

            return JsonResponse({"status": "payment failed processed"})

        elif event == "refund.processed":
            refund_id = data["payload"]["refund"]["entity"]["id"]
            payment_id = data["payload"]["refund"]["entity"]["payment_id"]

            try:
                payment = Payment.objects.get(razorpay_payment_id=payment_id)
            except Payment.DoesNotExist:
                return JsonResponse({"error": "Payment not found"}, status=404)

            payment.status = "refunded"
            payment.save()

            return JsonResponse({"status": f"refund {refund_id} processed"})

        else:
            return JsonResponse({"status": f"Unhandled event {event}"}, status=200)


# =====================================================
# Razorpay Checkout Views
# =====================================================
@csrf_exempt
def create_order(request, order_id):
    """ Create Razorpay order for checkout """
    order = get_object_or_404(Order, id=order_id, user=request.user)

    amount = int(order.total_amount * 100)  # paise
    currency = "INR"

    razorpay_order = razorpay_client.order.create({
        "amount": amount,
        "currency": currency,
        "payment_capture": 1,  # auto-capture
    })

    # Update or create payment record
    payment, _ = Payment.objects.update_or_create(
        order=order,
        defaults={
            "amount": order.total_amount,
            "status": "created",
            "payment_method": "razorpay",
            "razorpay_order_id": razorpay_order["id"],
        }
    )

    return JsonResponse({
        "order_id": razorpay_order["id"],
        "amount": amount,
        "currency": currency,
        "razorpay_key": os.environ.get("RAZORPAY_KEY_ID"),
    })


@csrf_exempt
def verify_payment(request):
    """ Verify payment signature from Razorpay """
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=400)

    data = json.loads(request.body)
    razorpay_order_id = data.get("razorpay_order_id")
    razorpay_payment_id = data.get("razorpay_payment_id")
    razorpay_signature = data.get("razorpay_signature")

    payment = get_object_or_404(Payment, razorpay_order_id=razorpay_order_id)

    try:
        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature
        })

        payment.status = "completed"
        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature = razorpay_signature
        payment.save()

        payment.order.status = "confirmed"
        payment.order.payment_status = "completed"
        payment.order.save()

        return JsonResponse({"status": "success", "message": "Payment verified successfully."})

    except razorpay.errors.SignatureVerificationError:
        payment.status = "failed"
        payment.save()
        return JsonResponse({"status": "failed", "message": "Payment verification failed."}, status=400)


from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Wishlist, WishlistItem
from products.models import Product
from .serializers import WishlistSerializer, WishlistItemSerializer

class WishlistView(generics.RetrieveAPIView):
    """View the current user's wishlist"""
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Get or create a wishlist for the current user
        wishlist, _ = Wishlist.objects.get_or_create(user=self.request.user)
        return wishlist


class AddToWishlistView(generics.CreateAPIView):
    """Add a product to the wishlist"""
    serializer_class = WishlistItemSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({"error": "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, id=product_id)
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)

        # Prevent duplicate entries
        item, created = WishlistItem.objects.get_or_create(wishlist=wishlist, product=product)
        if not created:
            return Response({"message": "Product already in wishlist"}, status=status.HTTP_200_OK)

        serializer = WishlistItemSerializer(item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RemoveFromWishlistView(generics.DestroyAPIView):
    """Remove a product from the wishlist"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, product_id, *args, **kwargs):
        wishlist = get_object_or_404(Wishlist, user=request.user)
        item = get_object_or_404(WishlistItem, wishlist=wishlist, product_id=product_id)
        item.delete()
        return Response({"message": "Product removed from wishlist"}, status=status.HTTP_204_NO_CONTENT)


# =====================================================
# DRF Views (Cart / Order / Payment)
# =====================================================
class BaseCartMixin:
    def get_cart(self):
        user = self.request.user
        cache_key = f"cart:{user.id}"
        cart = cache.get(cache_key)
        if not cart:
            cart, _ = Cart.objects.get_or_create(user=user)
            cache.set(cache_key, cart, timeout=60*30)
        return cart


class CartView(BaseCartMixin, generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.get_cart()


class CartItemView(BaseCartMixin, generics.ListCreateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    extra_kwargs = {
            'product': {'required': False}  # so only quantity is required for update
        }

    def get_queryset(self):
        return CartItem.objects.filter(cart=self.get_cart())

    def perform_create(self, serializer):
        serializer.save(cart=self.get_cart())
        cache.delete(f"cart:{self.request.user.id}")

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        cart = self.get_cart()
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_201_CREATED)



class CartItemDetailView(BaseCartMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(cart=self.get_cart())

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db import transaction
import uuid
from .models import Order, Cart
from .serializers import CreateOrderSerializer, OrderSerializer, OrderItemSerializer

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from orders.models import Order
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def confirm_cod(request, order_id):
    """
    Confirm Cash-on-Delivery order
    """
    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response({"detail": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    if order.payment_method != "cod":
        return Response({"detail": "This order is not COD"}, status=status.HTTP_400_BAD_REQUEST)

    if order.payment_status == "paid":
        return Response({"detail": "Order already confirmed"}, status=status.HTTP_400_BAD_REQUEST)

    # Mark payment as 'paid' for COD
    order.payment_status = "Cash on Delivery"  # ✅ Use 'paid' instead of 'COD'
    order.status = "confirmed"
    order.save()
    total_amount = sum([item.product.price * item.quantity for item in order.items.all()])

    # Optionally, create a Payment object for consistency
    Payment.objects.create(
        order=order,
        payment_method='cod',
        razorpay_payment_id=None,  # no online payment ID
        status='cod',
        amount=total_amount,
        razorpay_order_id = None,
        razorpay_signature = None,
        transaction_id = None,
    )

    return Response({"detail": "COD confirmed successfully"}, status=status.HTTP_200_OK)


from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer, CreateOrderSerializer

class OrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        return CreateOrderSerializer if self.request.method == "POST" else OrderSerializer

    def get_queryset(self):
        user = self.request.user
        return Order.objects.all() if user.is_staff else Order.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        order = serializer.save()  # CreateOrderSerializer.create() handles items

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

class OrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Order.objects.all() if user.is_staff else Order.objects.filter(user=user)
import razorpay
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Order, Payment
from .serializers import PaymentSerializer
from django.conf import settings


# 1️⃣ Create Razorpay Order
class ProcessPaymentView(APIView):
    def post(self, request, order_id):
        try:
            order = Order.objects.get(pk=order_id)
            # Create Razorpay order
            razorpay_order = razorpay_client.order.create({
                "amount": int(order.total_amount * 100),
                "currency": "INR",
                "payment_capture": 1,
            })
            # Save as pending
            payment, created = Payment.objects.get_or_create(
                order=order,
                defaults={"amount": order.total_amount, "status": "created", "razorpay_order_id": razorpay_order['id']}
            )

            return Response({
                "order_id": razorpay_order['id'],
                "amount": razorpay_order['amount'],
                "currency": razorpay_order['currency'],
                "payment": PaymentSerializer(payment).data
            })
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=404)

# 2️⃣ Verify Razorpay Payment
class VerifyPaymentView(APIView):
    def post(self, request, order_id):
        try:
            payment = Payment.objects.get(order__id=order_id)
            data = request.data

            # Verify signature
            params_dict = {
                'razorpay_order_id': data['razorpay_order_id'],
                'razorpay_payment_id': data['razorpay_payment_id'],
                'razorpay_signature': data['razorpay_signature']
            }

            try:
                razorpay_client.utility.verify_payment_signature(params_dict)
            except razorpay.errors.SignatureVerificationError:
                payment.status = "failed"
                payment.save()

                # Also mark order as failed
                payment.order.status = "payment_failed"
                payment.order.save()

                return Response({"error": "Payment verification failed"}, status=400)

            # Mark payment as completed
            payment.status = "completed"
            payment.razorpay_payment_id = data['razorpay_payment_id']
            payment.razorpay_signature = data['razorpay_signature']
            payment.save()

            # ✅ Update Order status too
            payment.order.status = "confirmed"  # or "completed" depending on your Order.status choices
            payment.order.save()

            return Response(PaymentSerializer(payment).data)

        except Payment.DoesNotExist:
            return Response({"error": "Payment not found"}, status=404)


# views.py
class CancelPaymentView(APIView):
    """Optional: Mark payment as cancelled."""
    def post(self, request, order_id):
        try:
            payment = Payment.objects.get(order__id=order_id)
            payment.status = "cancelled"
            payment.save()  # signal auto-updates order
            return Response({"status": "Payment cancelled"})
        except Payment.DoesNotExist:
            return Response({"error": "Payment not found"}, status=404)

# views.py
class FailPaymentView(APIView):
    """Mark a payment as failed manually or via webhook."""
    def post(self, request, order_id):
        try:
            payment = Payment.objects.get(order__id=order_id)
            payment.status = "failed"
            payment.save()  # signal auto-updates order
            return Response({"status": "Payment marked as failed"})
        except Payment.DoesNotExist:
            return Response({"error": "Payment not found"}, status=404)



class PaymentView(generics.RetrieveUpdateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Payment.objects.all() if user.is_staff else Payment.objects.filter(order__user=user)
