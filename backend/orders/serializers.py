from rest_framework import serializers
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
