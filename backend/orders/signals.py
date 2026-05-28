import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Order

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Order)
def notify_new_order(sender, instance, created, **kwargs):
    if not created:
        return

    try:
        from bot.notifications import notify_admins_new_order
        notify_admins_new_order(instance)
    except Exception as exc:
        logger.warning('Order telegram notification failed: %s', exc)
