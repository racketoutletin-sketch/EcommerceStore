# common/utils.py
import os
from django.core.mail import send_mail
from django.conf import settings

def send_email(to_email, subject, message, html_message=None):
    """
    Send email using Django's backend.
    If using file-based backend, creates folder and prints path of saved email.

    NOTE: Prints a message at the start to confirm this function is being called.
    """
    print(f"[DEBUG] send_email called for: {to_email}, subject: {subject}")  # <--- Check if called

    # Ensure folder exists for file-based backend
    if settings.EMAIL_BACKEND == "django.core.mail.backends.filebased.EmailBackend":
        os.makedirs(settings.EMAIL_FILE_PATH, exist_ok=True)

    # Send email
    from_email = settings.DEFAULT_FROM_EMAIL
    send_mail(
        subject=subject,
        message=message,
        from_email=from_email,
        recipient_list=[to_email],
        html_message=html_message,
        fail_silently=False,
    )
