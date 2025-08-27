from rest_framework import serializers
from .models import Notification, EmailTemplate

class NotificationSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Notification
        fields = (
            'id', 'type', 'type_display', 'subject', 'message', 
            'status', 'status_display', 'created_at', 'sent_at'
        )
        read_only_fields = ('status', 'created_at', 'sent_at')


class EmailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailTemplate
        fields = (
            'id', 'name', 'subject', 'html_content', 'text_content', 
            'created_at', 'updated_at'
        )
