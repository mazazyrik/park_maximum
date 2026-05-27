from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Tariff, PopularRoute, NewTerritoryCity
from .serializers import TariffSerializer, PopularRouteSerializer, PricingConfigSerializer


class TariffListView(generics.ListAPIView):
    queryset = Tariff.objects.filter(is_active=True).prefetch_related('cars')
    serializer_class = TariffSerializer


class PopularRouteListView(generics.ListAPIView):
    queryset = PopularRoute.objects.filter(is_active=True).prefetch_related('prices__tariff')
    serializer_class = PopularRouteSerializer


class PricingConfigView(APIView):
    def get(self, request):
        data = {
            'new_territory_cities': list(
                NewTerritoryCity.objects.filter(is_active=True).values_list('name', flat=True)
            ),
            'minivan_slugs': ['minivan', 'minivan8'],
        }
        serializer = PricingConfigSerializer(data)
        return Response(serializer.data)
