from django.urls import path
from .views import (
    TariffListView,
    PopularRouteListView,
    NewTerritoryRouteListView,
    PricingConfigView,
)

urlpatterns = [
    path('tariffs/', TariffListView.as_view(), name='tariff-list'),
    path('routes/', PopularRouteListView.as_view(), name='route-list'),
    path('new-territories/', NewTerritoryRouteListView.as_view(), name='new-territory-list'),
    path('pricing-config/', PricingConfigView.as_view(), name='pricing-config'),
]
