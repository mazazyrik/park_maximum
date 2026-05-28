from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0002_allow_null_trip_datetime'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='status',
            field=models.CharField(
                choices=[
                    ('new', 'Новая'),
                    ('accepted', 'Принята'),
                    ('in_progress', 'В пути'),
                    ('completed', 'Завершена'),
                    ('cancelled', 'Отменена'),
                    ('rejected', 'Отклонена'),
                ],
                db_index=True,
                default='new',
                max_length=20,
                verbose_name='Статус',
            ),
        ),
    ]
