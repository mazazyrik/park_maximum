from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):
    dependencies = [
        ('bot', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ordernotification',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, verbose_name='Создано'),
        ),
        migrations.AlterField(
            model_name='ordernotification',
            name='message_id',
            field=models.BigIntegerField(blank=True, null=True, verbose_name='Message ID'),
        ),
        migrations.AddField(
            model_name='ordernotification',
            name='attempts',
            field=models.PositiveSmallIntegerField(default=0, verbose_name='Попыток'),
        ),
        migrations.AddField(
            model_name='ordernotification',
            name='last_error',
            field=models.TextField(blank=True, verbose_name='Последняя ошибка'),
        ),
        migrations.AddField(
            model_name='ordernotification',
            name='next_attempt_at',
            field=models.DateTimeField(
                db_index=True,
                default=django.utils.timezone.now,
                verbose_name='Следующая попытка',
            ),
        ),
        migrations.AddField(
            model_name='ordernotification',
            name='sent_at',
            field=models.DateTimeField(blank=True, null=True, verbose_name='Отправлено'),
        ),
        migrations.AddField(
            model_name='ordernotification',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Ожидает отправки'),
                    ('sent', 'Отправлено'),
                    ('retry_pending', 'Ожидает повторной отправки'),
                ],
                db_index=True,
                default='pending',
                max_length=20,
                verbose_name='Статус',
            ),
        ),
    ]
