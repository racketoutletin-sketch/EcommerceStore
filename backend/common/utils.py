# common/utils.py
import os
from django.core.mail import send_mail
from django.conf import settings
from twilio.rest import Client
import firebase_admin
from firebase_admin import credentials, messaging

def send_email(to_email, subject, message, html_message=None):
    """
    Send email using SendGrid or Django's email backend.
    """
    from_email = settings.DEFAULT_FROM_EMAIL
    
    send_mail(
        subject,
        message,
        from_email,
        [to_email],
        html_message=html_message,
        fail_silently=False,
    )

def send_sms(to_phone_number, message):
    """
    Send SMS using Twilio.
    """
    account_sid = settings.TWILIO_ACCOUNT_SID
    auth_token = settings.TWILIO_AUTH_TOKEN
    
    client = Client(account_sid, auth_token)
    
    message = client.messages.create(
        body=message,
        from_=settings.TWILIO_PHONE_NUMBER,
        to=to_phone_number
    )
    
    return message.sid

def send_push_notification(token, title, body, data=None):
    """
    Send push notification using Firebase Cloud Messaging.
    """
    if not firebase_admin._apps:
        cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_KEY)
        firebase_admin.initialize_app(cred)
    
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        token=token,
        data=data or {}
    )
    
    response = messaging.send(message)
    return response