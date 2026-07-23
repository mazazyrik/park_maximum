from decimal import Decimal

from rest_framework import serializers
from catalog.constants import MINIMUM_DISTANCE_KM
from .models import Order


class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = (
            'from_address', 'to_address', 'tariff', 'car',
            'trip_datetime', 'need_docs', 'distance_km',
            'estimated_cost', 'fio', 'phone',
        )
        extra_kwargs = {
            'from_address': {'required': True},
            'to_address': {'required': True},
            'trip_datetime': {'required': False, 'allow_null': True},
            'tariff': {'required': False, 'allow_null': True},
            'car': {'required': False, 'allow_null': True},
            'distance_km': {'required': False},
            'estimated_cost': {'required': False},
            'need_docs': {'required': False},
        }

    def validate_phone(self, value):
        cleaned = ''.join(c for c in value if c.isdigit() or c in '+-() ')
        if len(''.join(c for c in cleaned if c.isdigit())) < 10:
            raise serializers.ValidationError('Введите корректный номер телефона.')
        return value

    def validate(self, attrs):
        tariff = attrs.get('tariff')
        distance_km = attrs.get('distance_km', 0)
        estimated_cost = attrs.get('estimated_cost', Decimal('0'))

        if tariff is not None and distance_km < MINIMUM_DISTANCE_KM:
            raise serializers.ValidationError({
                'distance_km': (
                    f'Минимальная протяжённость поездки — '
                    f'{MINIMUM_DISTANCE_KM} км.'
                ),
            })

        if tariff is None:
            errors = {}
            if distance_km != 0:
                errors['distance_km'] = (
                    'Для ручной заявки расстояние должно быть равно 0.'
                )
            if estimated_cost != Decimal('0'):
                errors['estimated_cost'] = (
                    'Для ручной заявки стоимость должна быть равна 0.'
                )
            if errors:
                raise serializers.ValidationError(errors)

        return attrs


class OrderDetailSerializer(serializers.ModelSerializer):
    tariff_name = serializers.CharField(source='tariff.name', read_only=True)
    car_name = serializers.CharField(source='car.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'from_address', 'to_address', 'tariff', 'tariff_name',
            'car', 'car_name', 'trip_datetime', 'need_docs', 'distance_km',
            'estimated_cost', 'fio', 'phone', 'status', 'status_display', 'created_at',
        )
