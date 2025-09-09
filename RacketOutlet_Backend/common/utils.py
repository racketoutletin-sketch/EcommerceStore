import os
from django.core.mail import send_mail
from django.conf import settings

def send_email(to_email, subject, message, html_message=None):
    """
    Send email using Django's backend.
    If using file-based backend, ensure folder exists.
    """
    print(f"[DEBUG] send_email called for: {to_email}, subject: {subject}")

    # Ensure folder exists if using file-based backend
    if settings.EMAIL_BACKEND == "django.core.mail.backends.filebased.EmailBackend":
        os.makedirs(settings.EMAIL_FILE_PATH, exist_ok=True)

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[to_email],
        html_message=html_message,
        fail_silently=False,
    )
