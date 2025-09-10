from django.core.mail import EmailMultiAlternatives
from django.conf import settings

def send_email(to_email, subject, html_message):
    """
    Send an HTML-only email. Sets a fallback text to avoid email client issues.
    """
    fallback_text = "Your email client does not support HTML. Please view this email in a browser."
    email = EmailMultiAlternatives(
        subject=subject,
        body=fallback_text,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[to_email],
    )
    email.attach_alternative(html_message, "text/html")
    email.send()
