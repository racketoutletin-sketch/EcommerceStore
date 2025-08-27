# notifications/services.py
from django.template import Template, Context
from .models import Notification, EmailTemplate
from common.utils import send_email

def send_order_email(order):
    """
    Send order confirmation email only if payment status is 'completed'.
    Creates a Notification record.
    """
    if not hasattr(order, 'payment') or order.payment.status.lower() not in ('completed', 'cod'):
        # Payment not completed or not COD, do nothing
        print(f"[DEBUG] Payment not completed for order {order.id}. Email not sent.")
        return

    # Get or create email template
    template, _ = EmailTemplate.objects.get_or_create(
        name='order_confirmation',
        defaults={
            'subject': 'Order Confirmation - RacketOutlet',
            'html_content': '<p>Hi {{ user.username }}, your order {{ order.id }} has been confirmed!</p>',
            'text_content': 'Hi {{ user.username }}, your order {{ order.id }} has been confirmed!',
        }
    )

    # Prepare context
    context = {
        'order': order,
        'user': order.user,
        'items': order.items.all() if hasattr(order, 'items') else [],
        'total_amount': getattr(order, 'total_amount', None)
    }

    # Render email content
    html_content = Template(template.html_content).render(Context(context))
    text_content = Template(template.text_content).render(Context(context)) if template.text_content else None

    # Send email
    send_email(
        to_email=order.user.email,
        subject=template.subject,
        message=text_content or html_content,
        html_message=html_content
    )

    # Create notification
    Notification.objects.create(
        user=order.user,
        type='email',
        subject=template.subject,
        message=text_content or html_content,
        status='sent'
    )
    print(f"[DEBUG] Order confirmation email sent for order {order.id}")
