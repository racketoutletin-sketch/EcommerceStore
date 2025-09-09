from django.template import Template, Context
from .models import Notification, EmailTemplate
from common.utils import send_email


def send_order_email(order):
    """
    Send order confirmation email only if payment status is 'completed' or COD.
    Creates a Notification record.
    """
    if not hasattr(order, 'payment') or order.payment.status.lower() not in ('completed', 'cod'):
        print(f"[DEBUG] Payment not completed for order {order.id}. Email not sent.")
        return

    # Get or create email template
    template, _ = EmailTemplate.objects.get_or_create(
        name='order_confirmation',
        defaults={
            'subject': 'Order Confirmation - RacketOutlet',
            'html_content': """
                <h2>Hi {{ user.username }},</h2>
                <p>Thank you for shopping with us! Your order <b>#{{ order.id }}</b> has been confirmed.</p>
                
                <h3>Order Details:</h3>
                <table border="1" cellspacing="0" cellpadding="8" style="border-collapse: collapse; width: 100%;">
                    <thead>
                        <tr>
                            <th style="text-align:left;">Product</th>
                            <th style="text-align:right;">Qty</th>
                            <th style="text-align:right;">Price</th>
                            <th style="text-align:right;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {% for item in items %}
                            <tr>
                                <td>{{ item.product.name }}</td>
                                <td style="text-align:right;">{{ item.quantity }}</td>
                                <td style="text-align:right;">{{ item.price }}</td>
                                <td style="text-align:right;">{{ item.subtotal }}</td>
                            </tr>
                        {% empty %}
                            <tr>
                                <td colspan="4" style="text-align:center;">No items found.</td>
                            </tr>
                        {% endfor %}
                        <tr>
                            <td colspan="3" style="text-align:right; font-weight:bold;">Total:</td>
                            <td style="text-align:right; font-weight:bold;">{{ total_amount }}</td>
                        </tr>
                    </tbody>
                </table>

                <h3>Shipping Address</h3>
                <p>{{ shipping_address|linebreaksbr }}</p>

                <h3>Contact Info</h3>
                <p>
                    Phone: {{ contact_phone }}<br>
                    Email: {{ contact_email }}
                </p>

                <h3>Billing Address</h3>
                <p>{{ billing_address|linebreaksbr }}</p>

                <h3>Payment</h3>
                <p>
                    Method: {{ payment_method }}<br>
                    Status: <b>{{ payment_status }}</b>
                </p>

                <p>We’ll notify you once it ships.</p>
            """,
            'text_content': """
                Hi {{ user.username }},
                Your order #{{ order.id }} has been confirmed.

                Order details:
                {% for item in items %}
                    - {{ item.product.name }} x {{ item.quantity }} @ {{ item.price }} = {{ item.subtotal }}
                {% empty %}
                    No items found.
                {% endfor %}

                Total: {{ total_amount }}

                Shipping Address:
                {{ shipping_address }}

                Contact Info:
                Phone: {{ contact_phone }}
                Email: {{ contact_email }}

                Billing Address:
                {{ billing_address }}

                Payment:
                Method: {{ payment_method }}
                Status: {{ payment_status }}

                We’ll notify you once it ships.
            """,
        }
    )

    # Prepare context
    context = {
        'order': order,
        'user': order.user,
        'items': order.items.all() if hasattr(order, 'items') else [],
        'total_amount': getattr(order, 'total_amount', None),
        'shipping_address': getattr(order, 'shipping_address', ''),
        'billing_address': getattr(order, 'billing_address', ''),
        'contact_phone': getattr(order.user, 'phone', ''),
        'contact_email': order.user.email,
        'payment_method': getattr(order.payment, 'payment_method', ''),
        'payment_status': getattr(order.payment, 'status', ''),
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
