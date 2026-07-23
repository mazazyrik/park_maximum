from rest_framework.test import APITestCase
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
