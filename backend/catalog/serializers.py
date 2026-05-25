from rest_framework import serializers
from .models import Tariff, Car, PopularRoute, RoutePrice


class CarSerializer(serializers.ModelSerializer):
    total_price_per_km = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Car
        fields = ('id', 'name', 'photo_url', 'extra_price_per_km', 'total_price_per_km', 'sort_order')

    def get_photo_url(self, obj):
        request = self.context.get('request')
        if obj.photo and request:
            return request.build_absolute_uri(obj.photo.url)
        return None


class TariffSerializer(serializers.ModelSerializer):
    cars = CarSerializer(many=True, read_only=True, source='cars.filter')

    class Meta:
        model = Tariff
        fields = ('id', 'name', 'slug', 'price_per_km', 'cars')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['cars'] = CarSerializer(
            instance.cars.filter(is_active=True),
            many=True,
            context=self.context,
        ).data
        return data


class RoutePriceSerializer(serializers.ModelSerializer):
    tariff_slug = serializers.CharField(source='tariff.slug', read_only=True)
    tariff_name = serializers.CharField(source='tariff.name', read_only=True)

    class Meta:
        model = RoutePrice
        fields = ('tariff_slug', 'tariff_name', 'price')


class PopularRouteSerializer(serializers.ModelSerializer):
    prices = RoutePriceSerializer(many=True, read_only=True)

    class Meta:
        model = PopularRoute
        fields = ('id', 'from_city', 'to_city', 'prices')
