# orders/serializers.py
from rest_framework import serializers
from django.conf import settings
from .models import Cart, CartItem, Order, OrderItem, Payment
from products.serializers import ProductListSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.ReadOnlyField()
    
    class Meta:
        model = CartItem
        fields = ('id', 'product', 'product_id', 'quantity', 'subtotal')
    
    def create(self, validated_data):
        product_id = validated_data.pop('product_id')
        cart = validated_data['cart']
        
        # Check if product exists
        try:
            from products.models import Product
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            raise serializers.ValidationError({"product_id": "Product not found"})
        
        # Check if product is active
        if not product.is_active:
            raise serializers.ValidationError({"product_id": "Product is not active"})
        
        # Check if item already exists in cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': validated_data.get('quantity', 1)}
        )
        
        if not created:
            # Update quantity if item already exists
            cart_item.quantity += validated_data.get('quantity', 1)
            cart_item.save()
        
        return cart_item

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.ReadOnlyField()
    
    class Meta:
        model = Cart
        fields = ('id', 'items', 'total_price', 'created_at', 'updated_at')

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    subtotal = serializers.ReadOnlyField()
    
    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'quantity', 'price', 'subtotal')

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = ('id', 'order_number', 'user', 'status', 'total_amount', 
                  'shipping_address', 'billing_address', 'payment_method', 
                  'payment_status', 'notes', 'created_at', 'updated_at', 'items')
        read_only_fields = ('order_number', 'total_amount', 'payment_status')
    
    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name
        }

class CreateOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ('shipping_address', 'billing_address', 'payment_method', 'notes')
    
    def create(self, validated_data):
        user = self.context['request'].user
        cart = Cart.objects.get(user=user)
        cart_items = cart.items.all()
        
        if not cart_items:
            raise serializers.ValidationError("Cannot create order with empty cart")
        
        # Calculate total amount
        total_amount = sum(item.subtotal for item in cart_items)
        
        # Create order
        order = Order.objects.create(
            user=user,
            total_amount=total_amount,
            **validated_data
        )
        
        # Create order items
        for cart_item in cart_items:
            # Check inventory
            inventory = cart_item.product.inventory
            if inventory.quantity < cart_item.quantity:
                order.delete()
                raise serializers.ValidationError(f"Not enough stock for {cart_item.product.name}")
            
            # Create order item
            price = cart_item.product.discounted_price if cart_item.product.discounted_price else cart_item.product.price
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=price
            )
            
            # Update inventory
            inventory.quantity -= cart_item.quantity
            inventory.save()
        
        # Clear cart
        cart_items.delete()
        
        return order

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ('id', 'amount', 'status', 'payment_method', 'transaction_id', 'created_at', 'updated_at')
        read_only_fields = ('amount', 'status', 'created_at', 'updated_at')