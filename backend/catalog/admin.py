from django.contrib import admin
from django.utils.html import format_html
from .models import Tariff, Car, PopularRoute, RoutePrice, NewTerritoryCity


class CarInline(admin.TabularInline):
    model = Car
    extra = 1
    fields = ('name', 'photo', 'extra_price_per_km', 'is_active', 'sort_order')


@admin.register(Tariff)
class TariffAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'price_per_km', 'new_territory_price_per_km', 'cars_count', 'is_active', 'sort_order')
    list_editable = ('price_per_km', 'new_territory_price_per_km', 'is_active', 'sort_order')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [CarInline]

    @admin.display(description='Автомобилей')
    def cars_count(self, obj):
        return obj.cars.count()


@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ('name', 'tariff', 'extra_price_per_km', 'preview', 'is_active', 'sort_order')
    list_filter = ('tariff', 'is_active')
    list_editable = ('extra_price_per_km', 'is_active', 'sort_order')
    search_fields = ('name',)

    @admin.display(description='Фото')
    def preview(self, obj):
        if obj.photo:
            return format_html('<img src="{}" style="height:40px;border-radius:4px">', obj.photo.url)
        return '—'


class RoutePriceInline(admin.TabularInline):
    model = RoutePrice
    extra = 0
    fields = ('tariff', 'price')


@admin.register(PopularRoute)
class PopularRouteAdmin(admin.ModelAdmin):
    list_display = ('from_city', 'to_city', 'is_new_territory', 'prices_summary', 'is_active', 'sort_order')
    list_editable = ('is_new_territory', 'is_active', 'sort_order')
    inlines = [RoutePriceInline]

    @admin.display(description='Цены')
    def prices_summary(self, obj):
        parts = [f'{p.tariff.name}: {p.price}₽' for p in obj.prices.select_related('tariff')]
        return ', '.join(parts) if parts else '—'


@admin.register(NewTerritoryCity)
class NewTerritoryCityAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')
    list_editable = ('is_active',)
    search_fields = ('name',)
