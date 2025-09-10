from django.db.models.signals import post_save
from django.dispatch import receiver
from orders.models import Payment
from notifications.models import Notification
from notifications.services import send_order_email

@receiver(post_save, sender=Payment)
def send_order_email_on_payment(sender, instance, created, **kwargs):
    """
    Sends order confirmation email after payment is completed.
    Ensures email is sent only once per order.
    """
    # Only send for completed or COD payments
    if instance.status.lower() not in ('completed', 'cod'):
        return

    order = getattr(instance, 'order', None)
    if not order:
        return

    # Use a dedicated notification type and reference to avoid duplicates
    notification_exists = Notification.objects.filter(
        user=order.user,
        type='email',
        subject__icontains=f"Order Confirmation - #{order.id}"
    ).exists()

    if notification_exists:
        print(f"[DEBUG] Email already sent for order {order.id}")
        return

    # Send the order email
    send_order_email(order)
