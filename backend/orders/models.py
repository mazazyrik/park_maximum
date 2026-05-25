from django.db import models
from catalog.models import Tariff, Car


class Order(models.Model):
    STATUS_NEW = 'new'
    STATUS_ACCEPTED = 'accepted'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_COMPLETED = 'completed'
    STATUS_CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (STATUS_NEW, 'Новая'),
        (STATUS_ACCEPTED, 'Принята'),
        (STATUS_IN_PROGRESS, 'В пути'),
        (STATUS_COMPLETED, 'Завершена'),
        (STATUS_CANCELLED, 'Отменена'),
    ]

    from_address = models.TextField('Откуда')
    to_address = models.TextField('Куда')
    tariff = models.ForeignKey(
        Tariff,
        on_delete=models.PROTECT,
        related_name='orders',
        verbose_name='Тариф',
        null=True,
        blank=True,
    )
    car = models.ForeignKey(
        Car,
        on_delete=models.SET_NULL,
        related_name='orders',
        verbose_name='Автомобиль',
        null=True,
        blank=True,
    )
    trip_datetime = models.DateTimeField('Дата и время поездки')
    need_docs = models.BooleanField('Отчётные документы', default=False)
    distance_km = models.PositiveIntegerField('Расстояние (км)', default=0)
    estimated_cost = models.DecimalField('Примерная стоимость (руб)', max_digits=10, decimal_places=2, default=0)
    fio = models.CharField('ФИО', max_length=300)
    phone = models.CharField('Телефон', max_length=30)
    status = models.CharField(
        'Статус',
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_NEW,
        db_index=True,
    )
    notes = models.TextField('Заметки оператора', blank=True)
    created_at = models.DateTimeField('Дата заявки', auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField('Обновлено', auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Заявка'
        verbose_name_plural = 'Заявки'

    def __str__(self):
        return f'#{self.pk} {self.fio} — {self.from_address} → {self.to_address}'
