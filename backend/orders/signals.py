import logging
import requests
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order

logger = logging.getLogger(__name__)


def _send_telegram(text: str) -> None:
    token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID
    if not token or not chat_id:
        return
    try:
        requests.post(
            f'https://api.telegram.org/bot{token}/sendMessage',
            json={'chat_id': chat_id, 'text': text, 'parse_mode': 'HTML'},
            timeout=5,
        )
    except Exception as exc:
        logger.warning('Telegram notification failed: %s', exc)


@receiver(post_save, sender=Order)
def notify_new_order(sender, instance, created, **kwargs):
    if not created:
        return

    docs = 'Да' if instance.need_docs else 'Нет'
    car_line = f'\n🚗 <b>Автомобиль:</b> {instance.car.name}' if instance.car else ''
    text = (
        f'🆕 <b>Новая заявка #{instance.pk}</b>\n\n'
        f'👤 <b>ФИО:</b> {instance.fio}\n'
        f'📞 <b>Телефон:</b> {instance.phone}\n\n'
        f'📍 <b>Откуда:</b> {instance.from_address}\n'
        f'🏁 <b>Куда:</b> {instance.to_address}\n\n'
        f'📐 <b>Расстояние:</b> {instance.distance_km} км\n'
        f'💰 <b>Стоимость:</b> {instance.estimated_cost} руб\n'
        f'🏷 <b>Тариф:</b> {instance.tariff.name if instance.tariff else "—"}'
        f'{car_line}\n'
        f'🗓 <b>Дата поездки:</b> {instance.trip_datetime.strftime("%d.%m.%Y %H:%M")}\n'
        f'📄 <b>Отч. документы:</b> {docs}'
    )
    _send_telegram(text)
