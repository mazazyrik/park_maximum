import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('orders', '0003_add_rejected_status'),
    ]

    operations = [
        migrations.CreateModel(
            name='TelegramAdmin',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_id', models.BigIntegerField(unique=True, verbose_name='Telegram ID')),
                ('username', models.CharField(blank=True, max_length=150, verbose_name='Username')),
                ('full_name', models.CharField(blank=True, max_length=300, verbose_name='Имя')),
                ('added_at', models.DateTimeField(auto_now_add=True, verbose_name='Добавлен')),
                ('is_active', models.BooleanField(default=True, verbose_name='Активен')),
            ],
            options={
                'verbose_name': 'Telegram администратор',
                'verbose_name_plural': 'Telegram администраторы',
                'ordering': ['-added_at'],
            },
        ),
        migrations.CreateModel(
            name='OrderNotification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('telegram_user_id', models.BigIntegerField(verbose_name='Telegram ID')),
                ('message_id', models.BigIntegerField(verbose_name='Message ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Отправлено')),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='telegram_notifications', to='orders.order', verbose_name='Заявка')),
            ],
            options={
                'verbose_name': 'Telegram уведомление',
                'verbose_name_plural': 'Telegram уведомления',
                'ordering': ['-created_at'],
                'unique_together': {('order', 'telegram_user_id')},
            },
        ),
    ]
