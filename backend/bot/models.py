from django.db import models
from django.utils import timezone


class TelegramAdmin(models.Model):
    user_id = models.BigIntegerField('Telegram ID', unique=True)
    username = models.CharField('Username', max_length=150, blank=True)
    full_name = models.CharField('Имя', max_length=300, blank=True)
    added_at = models.DateTimeField('Добавлен', auto_now_add=True)
    is_active = models.BooleanField('Активен', default=True)

    class Meta:
        verbose_name = 'Telegram администратор'
        verbose_name_plural = 'Telegram администраторы'
        ordering = ['-added_at']

    def __str__(self):
        label = f'@{self.username}' if self.username else str(self.user_id)
        return label


class OrderNotification(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_SENT = 'sent'
    STATUS_RETRY_PENDING = 'retry_pending'
    STATUS_FAILED = 'failed'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Ожидает отправки'),
        (STATUS_SENT, 'Отправлено'),
        (STATUS_RETRY_PENDING, 'Ожидает повторной отправки'),
        (STATUS_FAILED, 'Не доставлено'),
    ]

    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='telegram_notifications',
        verbose_name='Заявка',
    )
    telegram_user_id = models.BigIntegerField('Telegram ID')
    message_id = models.BigIntegerField('Message ID', null=True, blank=True)
    status = models.CharField(
        'Статус',
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        db_index=True,
    )
    attempts = models.PositiveSmallIntegerField('Попыток', default=0)
    next_attempt_at = models.DateTimeField(
        'Следующая попытка',
        default=timezone.now,
        db_index=True,
    )
    last_error = models.TextField('Последняя ошибка', blank=True)
    created_at = models.DateTimeField('Создано', auto_now_add=True)
    sent_at = models.DateTimeField('Отправлено', null=True, blank=True)

    class Meta:
        verbose_name = 'Telegram уведомление'
        verbose_name_plural = 'Telegram уведомления'
        unique_together = ('order', 'telegram_user_id')
        ordering = ['-created_at']

    def __str__(self):
        return f'Order #{self.order_id} → {self.telegram_user_id}'
