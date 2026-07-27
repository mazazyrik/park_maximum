from bot.models import OrderNotification
from bot.services import get_notification_recipient_ids


def enqueue_admins_new_order(order):
    notifications = [
        OrderNotification(order=order, telegram_user_id=user_id)
        for user_id in get_notification_recipient_ids()
    ]
    OrderNotification.objects.bulk_create(notifications, ignore_conflicts=True)
