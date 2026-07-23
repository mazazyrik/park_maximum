from rest_framework.test import APITestCase
from .constants import MINIMUM_DISTANCE_KM


class PricingConfigTests(APITestCase):
    def test_config_exposes_minimum_distance(self):
        response = self.client.get('/api/v1/pricing-config/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data['minimum_distance_km'],
            MINIMUM_DISTANCE_KM,
        )
