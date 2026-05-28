from django.conf import settings
from django.db import transaction

from orders.models import Order
from bot.models import TelegramAdmin, OrderNotification


def is_master_admin(user_id):
    return bool(settings.TELEGRAM_MASTER_ADMIN_ID) and user_id == settings.TELEGRAM_MASTER_ADMIN_ID


def is_bot_admin(user_id):
    if is_master_admin(user_id):
        return True
    return TelegramAdmin.objects.filter(user_id=user_id, is_active=True).exists()


def get_notification_recipient_ids():
    recipient_ids = set()
    if settings.TELEGRAM_MASTER_ADMIN_ID:
        recipient_ids.add(settings.TELEGRAM_MASTER_ADMIN_ID)
    recipient_ids.update(
        TelegramAdmin.objects.filter(is_active=True).values_list('user_id', flat=True)
    )
    return recipient_ids


def get_active_admins():
    return list(TelegramAdmin.objects.filter(is_active=True).order_by('added_at'))


def get_recent_orders(limit=10):
    return list(Order.objects.select_related('tariff', 'car').order_by('-created_at')[:limit])


def add_or_activate_admin(user_id, username='', full_name=''):
    admin, created = TelegramAdmin.objects.update_or_create(
        user_id=user_id,
        defaults={
            'username': username or '',
            'full_name': full_name or '',
            'is_active': True,
        },
    )
    return admin, created


def deactivate_admin(user_id):
    updated = TelegramAdmin.objects.filter(user_id=user_id, is_active=True).update(is_active=False)
    return updated > 0


def get_order_notifications(order_id):
    return list(OrderNotification.objects.filter(order_id=order_id))


def process_order_action(order_id, action):
    with transaction.atomic():
        order = Order.objects.select_related('tariff', 'car').select_for_update().get(pk=order_id)
        if order.status != Order.STATUS_NEW:
            return None, 'already_processed'

        if action == 'accept':
            order.status = Order.STATUS_ACCEPTED
        elif action == 'reject':
            order.status = Order.STATUS_REJECTED
        else:
            return None, 'invalid_action'

        order.save(update_fields=['status', 'updated_at'])
        return order, 'ok'
