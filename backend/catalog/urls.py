from django.urls import path
from .views import TariffListView, PopularRouteListView, PricingConfigView

urlpatterns = [
    path('tariffs/', TariffListView.as_view(), name='tariff-list'),
    path('routes/', PopularRouteListView.as_view(), name='route-list'),
    path('pricing-config/', PricingConfigView.as_view(), name='pricing-config'),
]
