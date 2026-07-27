from datetime import timedelta

from django.conf import settings
from django.db import models, transaction
from django.utils import timezone

from bot.models import TelegramAdmin, OrderNotification
from orders.models import Order


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
    return list(
        OrderNotification.objects.filter(
            order_id=order_id,
            message_id__isnull=False,
        )
    )


def get_pending_order_notifications(limit=20):
    return list(
        OrderNotification.objects.select_related('order__tariff', 'order__car')
        .filter(
            status__in=[
                OrderNotification.STATUS_PENDING,
                OrderNotification.STATUS_RETRY_PENDING,
            ],
            next_attempt_at__lte=timezone.now(),
        )
        .order_by('next_attempt_at')[:limit]
    )


def mark_notification_sent(notification_id, message_id):
    OrderNotification.objects.filter(pk=notification_id).update(
        status=OrderNotification.STATUS_SENT,
        message_id=message_id,
        attempts=models.F('attempts') + 1,
        last_error='',
        sent_at=timezone.now(),
    )


def mark_notification_failed(notification_id, error):
    notification = OrderNotification.objects.get(pk=notification_id)
    attempts = notification.attempts + 1
    delay_seconds = min(300, 5 * (2 ** min(attempts - 1, 6)))
    notification.status = OrderNotification.STATUS_RETRY_PENDING
    notification.attempts = attempts
    notification.next_attempt_at = timezone.now() + timedelta(seconds=delay_seconds)
    notification.last_error = str(error)[:1000]
    notification.save(
        update_fields=[
            'status',
            'attempts',
            'next_attempt_at',
            'last_error',
        ]
    )


def mark_notification_permanently_failed(notification_id, error):
    notification = OrderNotification.objects.get(pk=notification_id)
    notification.status = OrderNotification.STATUS_FAILED
    notification.attempts += 1
    notification.last_error = str(error)[:1000]
    notification.save(update_fields=['status', 'attempts', 'last_error'])
    TelegramAdmin.objects.filter(
        user_id=notification.telegram_user_id,
        is_active=True,
    ).update(is_active=False)


def process_order_action(order_id, action):
    with transaction.atomic():
        order = Order.objects.select_for_update().get(pk=order_id)
        if order.status != Order.STATUS_NEW:
            return None, 'already_processed'

        if action == 'accept':
            order.status = Order.STATUS_ACCEPTED
        elif action == 'reject':
            order.status = Order.STATUS_REJECTED
        else:
            return None, 'invalid_action'

        order.save(update_fields=['status', 'updated_at'])

    order = Order.objects.select_related('tariff', 'car').get(pk=order_id)
    return order, 'ok'
