# notifications/serializers.py
from rest_framework import serializers
from .models import Notification, EmailTemplate

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'type', 'subject', 'message', 'status', 'created_at', 'sent_at')
        read_only_fields = ('status', 'created_at', 'sent_at')

class EmailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailTemplate
        fields = ('id', 'name', 'subject', 'html_content', 'text_content', 'created_at', 'updated_at')