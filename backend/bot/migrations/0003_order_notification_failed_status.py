from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('bot', '0002_order_notification_queue'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ordernotification',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Ожидает отправки'),
                    ('sent', 'Отправлено'),
                    ('retry_pending', 'Ожидает повторной отправки'),
                    ('failed', 'Не доставлено'),
                ],
                db_index=True,
                default='pending',
                max_length=20,
                verbose_name='Статус',
            ),
        ),
    ]
