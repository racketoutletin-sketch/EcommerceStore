# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Payment

@receiver(post_save, sender=Payment)
def sync_order_status(sender, instance: Payment, created, **kwargs):
    """
    Automatically update the associated Order status based on Payment status.
    """
    order = instance.order
    status = instance.status.lower()

    if status == "completed":
        order.status = "confirmed"
        order.payment_status = "completed"
    elif status == "failed":
        order.status = "payment_failed"  # You can also have 'payment_failed'
        order.payment_status = "failed"
    elif status == "cancelled":
        order.status = "cancelled"
        order.payment_status = "cancelled"
    elif status == "refunded":
        order.status = "refunded"
        order.payment_status = "refunded"
    elif status in ["created", "pending"]:
        order.status = "pending"
        order.payment_status = status

    order.save()
