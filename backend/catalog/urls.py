from django.urls import path
from .views import TariffListView, PopularRouteListView

urlpatterns = [
    path('tariffs/', TariffListView.as_view(), name='tariff-list'),
    path('routes/', PopularRouteListView.as_view(), name='route-list'),
]
