from django.template import Template, Context
from notifications.models import Notification

SUPABASE_PUBLIC_URL = "https://wzonllfccvmvoftahudd.supabase.co/storage/v1/object/public/media/"

def send_order_email(order):
    if not hasattr(order, 'payment') or order.payment.status.lower() not in ('completed', 'cod'):
        return

    # Prepare items
    items_context = []
    for item in order.items.all():
        product = item.product
        price = getattr(product, "discounted_price", product.price) or 0
        subtotal = price * item.quantity

        main_image_url = getattr(product, "main_image_url", None) or (
            f"{SUPABASE_PUBLIC_URL}{product.main_image.name}" if getattr(product, "main_image", None) else None
        )

        items_context.append({
            "product": product.name,
            "quantity": item.quantity,
            "price": product.current_price,
            "subtotal": item.subtotal,
            "main_image_url": main_image_url,
        })

    context = {
        "order": order,
        "order_number": getattr(order, "order_number", ""),
        "user": order.user,
        "user_name": getattr(order.user, "username", ""),
        "user_mobile": getattr(order.user, "phone_number", ""),
        "user_address": getattr(order.user, "address", ""),
        "shipping_person_name": getattr(order, "shipping_person_name", ""),
        "shipping_person_number": getattr(order, "shipping_person_number", ""),
        "items": items_context,
        "total_amount": getattr(order, "total_amount", 0),
        "shipping_address": getattr(order, "shipping_address", ""),
        "billing_address": getattr(order, "billing_address", ""),
        "payment_method": getattr(order.payment, "payment_method", ""),
        "payment_status": getattr(order.payment, "status", ""),
        "notes": getattr(order, "notes", ""),
        "created_at": getattr(order, "created_at", ""),
    }

    html_template = """
    <html>
    <body style="font-family: Arial, sans-serif; max-width:700px; margin:auto; color:#333;">
        <div style="border:1px solid #e0e0e0; padding:20px; background-color:#fafafa;">
            <div style="text-align:center; margin-bottom:20px;">
                <img src="https://i.postimg.cc/FH8zS8JF/logo.jpg" alt="RacketOutlet" style="width:150px;">
            </div>

            <h2>Hi {{ user_name }},</h2>
            <p>Thank you for shopping with us! Your order <b>#{{ order_number }}</b> has been confirmed.</p>
            <p>Mobile: {{ user_mobile }}<br>Address: {{ user_address|linebreaksbr }}</p>

            <h3>Shipping Details</h3>
            <p>
                Name: {{ shipping_person_name }}<br>
                Mobile: {{ shipping_person_number }}<br>
                Address: {{ shipping_address|linebreaksbr }}
            </p>

            <h3>Billing Address</h3>
            <p>{{ billing_address|linebreaksbr }}</p>

            <h3>Order Items</h3>
            <table style="width:100%; border-collapse: collapse; border:1px solid #ccc;">
                <thead>
                    <tr style="background-color:#1a73e8; color:white;">
                        <th style="padding:12px; text-align:left;">Product</th>
                        <th style="padding:12px; text-align:right;">Qty</th>
                        <th style="padding:12px; text-align:right;">Price</th>
                        <th style="padding:12px; text-align:right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {% for item in items %}
                    <tr>
                        <td style="padding:12px; border:1px solid #ccc;">
                            {% if item.main_image_url %}
                                <img src="{{ item.main_image_url }}" style="width:50px; height:auto; vertical-align:middle; margin-right:5px;">
                            {% endif %}
                            <b>{{ item.product }}</b>
                        </td>
                        <td style="text-align:right; padding:12px;">{{ item.quantity }}</td>
                        <td style="text-align:right; padding:12px;">₹{{ item.price }}</td>
                        <td style="text-align:right; padding:12px;">₹{{ item.subtotal }}</td>
                    </tr>
                    {% endfor %}
                    <tr style="font-weight:bold; background-color:#f2f2f2;">
                        <td colspan="3" style="text-align:right; padding:12px;">Total:</td>
                        <td style="text-align:right; padding:12px;">₹{{ total_amount }}</td>
                    </tr>
                </tbody>
            </table>

            <h3>Payment Details</h3>
            <p>Method: {{ payment_method }}<br>Status: {{ payment_status }}</p>

            {% if notes %}
            <h3>Additional Notes</h3>
            <p>{{ notes|linebreaksbr }}</p>
            {% endif %}

            <p style="font-size:12px; color:#777; margin-top:20px;">Order created at: {{ created_at }}</p>
        </div>
    </body>
    </html>
    """

    html_content = Template(html_template).render(Context(context))

    from common.utils import send_email
    send_email(order.user.email, f"Order Confirmation - #{order.order_number}", html_content)

    Notification.objects.create(
        user=order.user,
        type="email",
        subject=f"Order Confirmation - #{order.order_number}",
        message=html_content,
        status="sent"
    )

    print(f"[DEBUG] HTML-only email sent for order {order.order_number}")
