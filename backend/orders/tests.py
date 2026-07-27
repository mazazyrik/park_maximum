from django.test import override_settings
from rest_framework.test import APITestCase

from bot.models import OrderNotification, TelegramAdmin
from bot.services import mark_notification_permanently_failed
from catalog.models import Tariff
from catalog.constants import MINIMUM_DISTANCE_KM


class OrderMinimumDistanceTests(APITestCase):
    def setUp(self):
        self.tariff = Tariff.objects.create(
            name='Стандарт',
            slug='standard-test',
            price_per_km='30.00',
        )
        self.base_payload = {
            'from_address': 'Москва',
            'to_address': 'Тверь',
            'tariff': self.tariff.pk,
            'need_docs': False,
            'distance_km': MINIMUM_DISTANCE_KM,
            'estimated_cost': '6000.00',
            'fio': 'Иван Иванов',
            'phone': '+7 999 123-45-67',
        }

    def test_rejects_calculated_order_below_minimum(self):
        payload = {
            **self.base_payload,
            'distance_km': MINIMUM_DISTANCE_KM - 1,
        }

        response = self.client.post('/api/v1/orders/', payload, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.data['distance_km'][0],
            f'Минимальная протяжённость поездки — {MINIMUM_DISTANCE_KM} км.',
        )

    def test_accepts_calculated_order_at_minimum(self):
        response = self.client.post(
            '/api/v1/orders/',
            self.base_payload,
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['distance_km'], MINIMUM_DISTANCE_KM)

    @override_settings(TELEGRAM_MASTER_ADMIN_ID=123456789)
    def test_queues_notification_without_waiting_for_telegram(self):
        response = self.client.post(
            '/api/v1/orders/',
            self.base_payload,
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        notification = OrderNotification.objects.get(
            order_id=response.data['id'],
            telegram_user_id=123456789,
        )
        self.assertEqual(notification.status, OrderNotification.STATUS_PENDING)
        self.assertIsNone(notification.message_id)

    @override_settings(TELEGRAM_MASTER_ADMIN_ID=0)
    def test_permanent_telegram_error_deactivates_admin(self):
        admin = TelegramAdmin.objects.create(user_id=987654321)
        response = self.client.post(
            '/api/v1/orders/',
            self.base_payload,
            format='json',
        )
        notification = OrderNotification.objects.get(
            order_id=response.data['id'],
            telegram_user_id=admin.user_id,
        )

        mark_notification_permanently_failed(notification.pk, 'Chat not found')

        notification.refresh_from_db()
        admin.refresh_from_db()
        self.assertEqual(notification.status, OrderNotification.STATUS_FAILED)
        self.assertEqual(notification.attempts, 1)
        self.assertFalse(admin.is_active)

    def test_accepts_calculated_order_above_minimum(self):
        payload = {
            **self.base_payload,
            'distance_km': MINIMUM_DISTANCE_KM + 1,
        }

        response = self.client.post('/api/v1/orders/', payload, format='json')

        self.assertEqual(response.status_code, 201)

    def test_accepts_zero_distance_manual_request(self):
        payload = {
            **self.base_payload,
            'to_address': 'Новые регионы, детали уточнить у клиента',
            'tariff': None,
            'distance_km': 0,
            'estimated_cost': '0',
        }

        response = self.client.post('/api/v1/orders/', payload, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertIsNone(response.data['tariff'])

    def test_rejects_nonzero_manual_request(self):
        payload = {
            **self.base_payload,
            'tariff': None,
            'distance_km': MINIMUM_DISTANCE_KM,
        }

        response = self.client.post('/api/v1/orders/', payload, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('distance_km', response.data)
