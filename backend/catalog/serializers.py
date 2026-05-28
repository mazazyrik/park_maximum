from rest_framework import serializers
from .models import Tariff, Car, PopularRoute, NewTerritoryRoute


class CarSerializer(serializers.ModelSerializer):
    total_price_per_km = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Car
        fields = ('id', 'name', 'photo_url', 'extra_price_per_km', 'total_price_per_km', 'sort_order')

    def get_photo_url(self, obj):
        if obj.external_photo_url:
            return obj.external_photo_url
        request = self.context.get('request')
        if obj.photo and request:
            return request.build_absolute_uri(obj.photo.url)
        return None


class TariffSerializer(serializers.ModelSerializer):
    cars = serializers.SerializerMethodField()

    class Meta:
        model = Tariff
        fields = ('id', 'name', 'slug', 'price_per_km', 'cars')

    def get_cars(self, obj):
        return CarSerializer(
            obj.cars.filter(is_active=True),
            many=True,
            context=self.context,
        ).data


class PopularRouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PopularRoute
        fields = ('id', 'from_city', 'to_city')


class NewTerritoryRouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewTerritoryRoute
        fields = ('id', 'from_city', 'to_city', 'from_price')


class PricingConfigSerializer(serializers.Serializer):
    new_territory_cities = serializers.ListField(child=serializers.CharField())
    minivan_slugs = serializers.ListField(child=serializers.CharField())
