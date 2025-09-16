from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from threading import Thread

def send_email(to_email, subject, html_message):
    """
    Send an HTML-only email asynchronously.
    Sets a fallback text to avoid email client issues.
    """
    def _send():
        fallback_text = "Your email client does not support HTML. Please view this email in a browser."
        email = EmailMultiAlternatives(
            subject=subject,
            body=fallback_text,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email],
        )
        email.attach_alternative(html_message, "text/html")
        try:
            email.send()
            print(f"[DEBUG] Email sent to {to_email} successfully")
        except Exception as e:
            # Log the error but do not crash the request
            print(f"[ERROR] Failed to send email to {to_email}: {e}")

    # Run in a background thread
    Thread(target=_send).start()
