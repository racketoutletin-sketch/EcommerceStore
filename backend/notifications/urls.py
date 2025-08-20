# notifications/urls.py
from django.urls import path
from .views import (
    NotificationListView,
    NotificationDetailView,
    EmailTemplateListCreateView,
    EmailTemplateDetailView
)

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
    path('email-templates/', EmailTemplateListCreateView.as_view(), name='email-template-list-create'),
    path('email-templates/<int:pk>/', EmailTemplateDetailView.as_view(), name='email-template-detail'),
]