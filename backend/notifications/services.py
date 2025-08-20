# notifications/services.py
from django.conf import settings
from django.template.loader import render_to_string
from django.core.mail import send_mail
from .models import Notification, EmailTemplate
from orders.models import Order
from common.utils import send_email

def send_order_confirmation_email(order):
    """
    Send order confirmation email to the customer.
    """
    try:
        template = EmailTemplate.objects.get(name='order_confirmation')
    except EmailTemplate.DoesNotExist:
        # Create default template if it doesn't exist
        template = EmailTemplate.objects.create(
            name='order_confirmation',
            subject='Order Confirmation - RacketOutlet',
            html_content=render_to_string('emails/order_confirmation.html', {'order': order}),
            text_content=render_to_string('emails/order_confirmation.txt', {'order': order})
        )
    
    context = {
        'order': order,
        'user': order.user,
        'items': order.items.all(),
        'total_amount': order.total_amount
    }
    
    html_content = render_to_string(None, context, template.html_content)
    text_content = render_to_string(None, context, template.text_content) if template.text_content else None
    
    send_email(
        to_email=order.user.email,
        subject=template.subject,
        message=text_content or html_content,
        html_message=html_content
    )
    
    # Create notification record
    Notification.objects.create(
        user=order.user,
        type='email',
        subject=template.subject,
        message=text_content or html_content,
        status='sent'
    )

def send_payment_confirmation_email(order):
    """
    Send payment confirmation email to the customer.
    """
    try:
        template = EmailTemplate.objects.get(name='payment_confirmation')
    except EmailTemplate.DoesNotExist:
        # Create default template if it doesn't exist
        template = EmailTemplate.objects.create(
            name='payment_confirmation',
            subject='Payment Confirmation - RacketOutlet',
            html_content=render_to_string('emails/payment_confirmation.html', {'order': order}),
            text_content=render_to_string('emails/payment_confirmation.txt', {'order': order})
        )
    
    context = {
        'order': order,
        'user': order.user,
        'payment': order.payment,
        'total_amount': order.total_amount
    }
    
    html_content = render_to_string(None, context, template.html_content)
    text_content = render_to_string(None, context, template.text_content) if template.text_content else None
    
    send_email(
        to_email=order.user.email,
        subject=template.subject,
        message=text_content or html_content,
        html_message=html_content
    )
    
    # Create notification record
    Notification.objects.create(
        user=order.user,
        type='email',
        subject=template.subject,
        message=text_content or html_content,
        status='sent'
    )