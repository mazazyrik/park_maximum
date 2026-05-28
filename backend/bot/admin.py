from django.contrib import admin
from .models import TelegramAdmin, OrderNotification


@admin.register(TelegramAdmin)
class TelegramAdminAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'username', 'full_name', 'is_active', 'added_at')
    list_filter = ('is_active',)
    search_fields = ('user_id', 'username', 'full_name')


@admin.register(OrderNotification)
class OrderNotificationAdmin(admin.ModelAdmin):
    list_display = ('order', 'telegram_user_id', 'message_id', 'created_at')
    search_fields = ('telegram_user_id', 'message_id')
    raw_id_fields = ('order',)
