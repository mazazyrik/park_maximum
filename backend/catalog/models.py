from django.db import models


class Tariff(models.Model):
    name = models.CharField('Название', max_length=100)
    slug = models.SlugField('Slug', unique=True)
    price_per_km = models.DecimalField('Цена за км (руб)', max_digits=8, decimal_places=2)
    new_territory_price_per_km = models.DecimalField(
        'Цена за км — новые территории (руб)',
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
    )
    is_active = models.BooleanField('Активен', default=True)
    sort_order = models.PositiveIntegerField('Порядок', default=0)

    class Meta:
        ordering = ['sort_order']
        verbose_name = 'Тариф'
        verbose_name_plural = 'Тарифы'

    def __str__(self):
        return f'{self.name} ({self.price_per_km} руб/км)'


class Car(models.Model):
    tariff = models.ForeignKey(
        Tariff,
        on_delete=models.CASCADE,
        related_name='cars',
        verbose_name='Тариф',
    )
    name = models.CharField('Название автомобиля', max_length=200)
    photo = models.ImageField('Фото', upload_to='cars/', blank=True)
    external_photo_url = models.URLField('URL фото', blank=True)
    extra_price_per_km = models.DecimalField(
        'Доп. цена за км (руб)',
        max_digits=8,
        decimal_places=2,
        default=0,
        help_text='Добавляется к базовой ставке тарифа',
    )
    is_active = models.BooleanField('Активен', default=True)
    sort_order = models.PositiveIntegerField('Порядок', default=0)

    class Meta:
        ordering = ['sort_order']
        verbose_name = 'Автомобиль'
        verbose_name_plural = 'Автомобили'

    def __str__(self):
        return self.name

    @property
    def total_price_per_km(self):
        return self.tariff.price_per_km + self.extra_price_per_km


class PopularRoute(models.Model):
    from_city = models.CharField('Откуда', max_length=100)
    to_city = models.CharField('Куда', max_length=100)
    is_new_territory = models.BooleanField('Новая территория', default=False)
    is_active = models.BooleanField('Активен', default=True)
    sort_order = models.PositiveIntegerField('Порядок', default=0)

    class Meta:
        ordering = ['sort_order']
        verbose_name = 'Популярный маршрут'
        verbose_name_plural = 'Популярные маршруты'

    def __str__(self):
        return f'{self.from_city} → {self.to_city}'


class RoutePrice(models.Model):
    route = models.ForeignKey(
        PopularRoute,
        on_delete=models.CASCADE,
        related_name='prices',
        verbose_name='Маршрут',
    )
    tariff = models.ForeignKey(
        Tariff,
        on_delete=models.CASCADE,
        related_name='route_prices',
        verbose_name='Тариф',
    )
    price = models.DecimalField('Цена (руб)', max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ['route', 'tariff']
        verbose_name = 'Цена маршрута'
        verbose_name_plural = 'Цены маршрутов'

    def __str__(self):
        return f'{self.route} — {self.tariff.name}: {self.price} руб'


class NewTerritoryCity(models.Model):
    name = models.CharField('Город', max_length=100, unique=True)
    is_active = models.BooleanField('Активен', default=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Город новой территории'
        verbose_name_plural = 'Города новых территорий'

    def __str__(self):
        return self.name
