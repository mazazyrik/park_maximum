import logging

import requests
from django.conf import settings

from bot.formatting import format_order_message
from bot.models import OrderNotification
from bot.services import get_notification_recipient_ids

logger = logging.getLogger(__name__)


def _send_message(chat_id, text, reply_markup=None):
    token = settings.TELEGRAM_BOT_TOKEN
    if not token:
        return None

    payload = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML',
    }
    if reply_markup:
        payload['reply_markup'] = reply_markup

    try:
        response = requests.post(
            f'https://api.telegram.org/bot{token}/sendMessage',
            json=payload,
            timeout=5,
        )
        response.raise_for_status()
        data = response.json()
        if not data.get('ok'):
            logger.warning('Telegram sendMessage failed: %s', data)
            return None
        return data['result']['message_id']
    except Exception as exc:
        logger.warning('Telegram notification failed: %s', exc)
        return None


def _build_order_keyboard(order_id):
    return {
        'inline_keyboard': [
            [
                {'text': '✅ Принять', 'callback_data': f'accept_{order_id}'},
                {'text': '❌ Отклонить', 'callback_data': f'reject_{order_id}'},
            ],
        ],
    }


def notify_admins_new_order(order):
    recipient_ids = get_notification_recipient_ids()
    if not recipient_ids:
        return

    text = format_order_message(order)
    keyboard = _build_order_keyboard(order.pk)

    for user_id in recipient_ids:
        message_id = _send_message(user_id, text, reply_markup=keyboard)
        if message_id:
            OrderNotification.objects.update_or_create(
                order=order,
                telegram_user_id=user_id,
                defaults={'message_id': message_id},
            )
