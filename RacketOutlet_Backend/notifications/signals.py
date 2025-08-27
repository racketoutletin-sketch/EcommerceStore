# # notifications/signals.py
# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from orders.models import Payment  # your Payment model
# from notifications.models import Notification
# from notifications.services import send_order_email

# @receiver(post_save, sender=Payment)
# def send_order_email_on_payment(sender, instance, created, **kwargs):
#     """
#     Sends order confirmation email after payment is completed.
#     Ensures email is sent only once.
#     """
#     # Only act if payment status is 'completed' or 'cod'
#     if instance.status.lower() not in ('completed', 'cod'):
#         return

#     order = getattr(instance, 'order', None)
#     if not order:
#         return

#     # Check if a notification already exists for this order
#     existing = Notification.objects.filter(
#         user=order.user,
#         subject__icontains=f"Order {order.id}",
#         type='email'
#     ).exists()
#     if existing:
#         print(f"[DEBUG] Email already sent for order {order.id}")
#         return

#     # Send email
#     send_order_email(order)
