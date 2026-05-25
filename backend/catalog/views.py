from rest_framework import generics
from .models import Tariff, PopularRoute
from .serializers import TariffSerializer, PopularRouteSerializer


class TariffListView(generics.ListAPIView):
    queryset = Tariff.objects.filter(is_active=True).prefetch_related('cars')
    serializer_class = TariffSerializer


class PopularRouteListView(generics.ListAPIView):
    queryset = PopularRoute.objects.filter(is_active=True).prefetch_related('prices__tariff')
    serializer_class = PopularRouteSerializer
