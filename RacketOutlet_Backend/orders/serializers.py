import uuid
from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem, Payment, WishlistItem, Wishlist
from products.serializers import ProductSerializer
from products.models import Product

class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'added_at']

class WishlistSerializer(serializers.ModelSerializer):
    items = WishlistItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'items', 'total_items', 'created_at', 'updated_at']
        read_only_fields = ['user', 'items', 'total_items']

# ============================
# Cart & CartItem Serializers
# ============================
class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ("id", "product", "product_id", "quantity", "subtotal")

    def create(self, validated_data):
        product_id = validated_data.pop("product_id")
        cart = validated_data["cart"]

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            raise serializers.ValidationError({"product_id": "Product not found"})

        if not getattr(product, "is_active", True):
            raise serializers.ValidationError({"product_id": "Product is not active"})

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={"quantity": validated_data.get("quantity", 1)},
        )

        if not created:
            cart_item.quantity += validated_data.get("quantity", 1)
            cart_item.save()

        return cart_item


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ("id", "items", "total_price", "created_at", "updated_at")

from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductSerializer  # your product serializer

# Nested serializer for items in an order
class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ["id", "product", "quantity", "price", "subtotal"]

    def get_subtotal(self, obj):
        return obj.price * obj.quantity

from rest_framework import serializers
from .models import Order, OrderItem, Product
import uuid

# Input serializer for each item in the payload
class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

class CreateOrderSerializer(serializers.ModelSerializer):
    shipping_person_name = serializers.CharField(required=True)
    shipping_person_number = serializers.CharField(required=True)
    items = OrderItemInputSerializer(many=True, write_only=True)  # <-- use input serializer

    class Meta:
        model = Order
        fields = (
            "shipping_address",
            "billing_address",
            "shipping_person_name",
            "shipping_person_number",
            "payment_method",
            "notes",
            "items",
        )

    def create(self, validated_data):
        user = self.context["request"].user
        items_data = validated_data.pop("items")

        if not items_data:
            raise serializers.ValidationError("Cannot create order with empty items.")

        total_amount = 0

        order = Order.objects.create(
            user=user,
            total_amount=0,  # will update later
            order_number=f"ORD-{uuid.uuid4().hex[:8].upper()}",
            **validated_data,
        )

        for item in items_data:
            try:
                product = Product.objects.get(id=item["product_id"])
            except Product.DoesNotExist:
                order.delete()
                raise serializers.ValidationError(f"Product ID {item['product_id']} not found.")

            if product.inventory.quantity < item["quantity"]:
                order.delete()
                raise serializers.ValidationError(f"Not enough stock for {product.name}.")

            price = product.discounted_price or product.price

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item["quantity"],
                price=price,
            )

            total_amount += price * item["quantity"]

            # Deduct inventory
            product.inventory.quantity -= item["quantity"]
            product.inventory.save()

        # Update order total
        order.total_amount = total_amount
        order.save()

        return order



# Serializer for returning order details (frontend GET/POST response)
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "user",
            "status",
            "total_amount",
            "shipping_address",
            "billing_address",
            "shipping_person_name",   # <-- add this
            "shipping_person_number", # <-- add this
            "payment_method",
            "payment_status",
            "notes",
            "created_at",
            "updated_at",
            "items",
        ]
        read_only_fields = ("order_number", "total_amount", "payment_status")


    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "email": obj.user.email,
            "username": obj.user.username,
            "first_name": obj.user.first_name,
            "last_name": obj.user.last_name,
            "phone_number": obj.user.phone_number,
            "address": obj.user.address,
        }


# ============================
# Payment Serializer
# ============================
class PaymentSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = (
            "id",
            "order",
            "amount",
            "status",
            "payment_method",
            "transaction_id",
            "razorpay_order_id",
            "razorpay_payment_id",
            "razorpay_signature",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("amount", "status", "created_at", "updated_at")
