import os
from django.db.models.signals import pre_save, post_delete
from django.dispatch import receiver
from .models import UserProfile


# Delete old profile picture on update
@receiver(pre_save, sender=UserProfile)
def delete_old_profile_picture(sender, instance, **kwargs):
    if not instance.pk:
        return False  # new object, nothing to delete

    try:
        old_file = UserProfile.objects.get(pk=instance.pk).profile_picture
    except UserProfile.DoesNotExist:
        return False

    new_file = instance.profile_picture
    if old_file and old_file != new_file:
        old_file.delete(save=False)


# Delete profile picture file when UserProfile is deleted
@receiver(post_delete, sender=UserProfile)
def delete_profile_picture_on_delete(sender, instance, **kwargs):
    if instance.profile_picture:
        instance.profile_picture.delete(save=False)
