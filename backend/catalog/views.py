from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Tariff, PopularRoute, NewTerritoryRoute
from .serializers import (
    TariffSerializer,
    PopularRouteSerializer,
    NewTerritoryRouteSerializer,
    PricingConfigSerializer,
)
from .constants import MINIMUM_DISTANCE_KM


class TariffListView(generics.ListAPIView):
    queryset = Tariff.objects.filter(is_active=True).prefetch_related('cars')
    serializer_class = TariffSerializer


class PopularRouteListView(generics.ListAPIView):
    queryset = PopularRoute.objects.filter(is_active=True)
    serializer_class = PopularRouteSerializer


class NewTerritoryRouteListView(generics.ListAPIView):
    queryset = NewTerritoryRoute.objects.filter(is_active=True)
    serializer_class = NewTerritoryRouteSerializer


class PricingConfigView(APIView):
    def get(self, request):
        data = {
            'new_territory_cities': list(
                NewTerritoryRoute.objects.filter(is_active=True).values_list('to_city', flat=True)
            ),
            'minivan_slugs': ['minivan', 'minivan8'],
            'minimum_distance_km': MINIMUM_DISTANCE_KM,
        }
        serializer = PricingConfigSerializer(data)
        return Response(serializer.data)
