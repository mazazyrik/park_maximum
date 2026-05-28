from django.contrib import admin
from django.utils.html import format_html
from .models import Tariff, Car, PopularRoute, NewTerritoryRoute


class CarInline(admin.TabularInline):
    model = Car
    extra = 1
    fields = ('name', 'photo', 'external_photo_url', 'extra_price_per_km', 'is_active', 'sort_order')


@admin.register(Tariff)
class TariffAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'price_per_km', 'cars_count', 'is_active', 'sort_order')
    list_editable = ('price_per_km', 'is_active', 'sort_order')
    list_filter = ('is_active',)
    search_fields = ('name', 'slug')
    ordering = ('sort_order', 'name')
    prepopulated_fields = {'slug': ('name',)}
    fields = ('name', 'slug', 'price_per_km', 'is_active', 'sort_order')
    inlines = [CarInline]

    @admin.display(description='Автомобилей')
    def cars_count(self, obj):
        return obj.cars.count()


@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ('pk', 'name', 'tariff', 'extra_price_per_km', 'preview', 'is_active', 'sort_order')
    list_editable = ('name', 'tariff', 'extra_price_per_km', 'is_active', 'sort_order')
    list_filter = ('tariff', 'is_active')
    search_fields = ('name', 'tariff__name')
    ordering = ('tariff__sort_order', 'sort_order', 'name')
    fields = ('tariff', 'name', 'photo', 'external_photo_url', 'extra_price_per_km', 'is_active', 'sort_order')

    @admin.display(description='Фото')
    def preview(self, obj):
        url = obj.external_photo_url or (obj.photo.url if obj.photo else '')
        if url:
            return format_html('<img src="{}" style="height:40px;border-radius:4px">', url)
        return '—'


@admin.register(PopularRoute)
class PopularRouteAdmin(admin.ModelAdmin):
    list_display = ('pk', 'from_city', 'to_city', 'is_active', 'sort_order')
    list_editable = ('from_city', 'to_city', 'is_active', 'sort_order')
    list_filter = ('is_active',)
    search_fields = ('from_city', 'to_city')
    ordering = ('sort_order', 'from_city', 'to_city')
    fields = ('from_city', 'to_city', 'is_active', 'sort_order')


@admin.register(NewTerritoryRoute)
class NewTerritoryRouteAdmin(admin.ModelAdmin):
    list_display = ('pk', 'from_city', 'to_city', 'from_price', 'is_active', 'sort_order')
    list_editable = ('from_city', 'to_city', 'from_price', 'is_active', 'sort_order')
    list_filter = ('is_active',)
    search_fields = ('from_city', 'to_city')
    ordering = ('sort_order', 'from_city', 'to_city')
    fields = ('from_city', 'to_city', 'from_price', 'is_active', 'sort_order')
