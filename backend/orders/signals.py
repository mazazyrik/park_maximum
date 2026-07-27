from django.db.models.signals import post_save
from django.dispatch import receiver

from bot.notifications import enqueue_admins_new_order

from .models import Order


@receiver(post_save, sender=Order)
def notify_new_order(sender, instance, created, **kwargs):
    if created:
        enqueue_admins_new_order(instance)
