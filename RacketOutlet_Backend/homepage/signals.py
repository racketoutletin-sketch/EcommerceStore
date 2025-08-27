from django.db.models.signals import pre_save, post_delete
from django.dispatch import receiver
from .models import Banner, HomeVideo, ShopTheLook


# -------------------------
# Delete old file when updating
# -------------------------
def delete_old_file(instance, field_name, old_file):
    """Helper to delete old file from Supabase storage."""
    field = getattr(instance, field_name, None)
    if old_file and (not field or old_file.name != field.name):
        old_file.storage.delete(old_file.name)


# -------------------------
# Banner
# -------------------------
@receiver(pre_save, sender=Banner)
def auto_delete_old_banner_image(sender, instance, **kwargs):
    if not instance.pk:
        return  # new object, skip
    try:
        old_instance = Banner.objects.get(pk=instance.pk)
    except Banner.DoesNotExist:
        return
    delete_old_file(instance, "image", old_instance.image)


@receiver(post_delete, sender=Banner)
def auto_delete_banner_on_delete(sender, instance, **kwargs):
    if instance.image and instance.image.name:
        instance.image.storage.delete(instance.image.name)


# -------------------------
# HomeVideo
# -------------------------
@receiver(pre_save, sender=HomeVideo)
def auto_delete_old_video(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        old_instance = HomeVideo.objects.get(pk=instance.pk)
    except HomeVideo.DoesNotExist:
        return
    delete_old_file(instance, "video", old_instance.video)


@receiver(post_delete, sender=HomeVideo)
def auto_delete_video_on_delete(sender, instance, **kwargs):
    if instance.video and instance.video.name:
        instance.video.storage.delete(instance.video.name)


# -------------------------
# ShopTheLook
# -------------------------
@receiver(pre_save, sender=ShopTheLook)
def auto_delete_old_player_image(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        old_instance = ShopTheLook.objects.get(pk=instance.pk)
    except ShopTheLook.DoesNotExist:
        return
    delete_old_file(instance, "player_image", old_instance.player_image)


@receiver(post_delete, sender=ShopTheLook)
def auto_delete_player_image_on_delete(sender, instance, **kwargs):
    if instance.player_image and instance.player_image.name:
        instance.player_image.storage.delete(instance.player_image.name)
