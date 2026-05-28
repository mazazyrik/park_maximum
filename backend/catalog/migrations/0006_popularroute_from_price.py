from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0005_car_external_photo_url'),
    ]

    operations = [
        migrations.AddField(
            model_name='popularroute',
            name='from_price',
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                help_text='Фиксированная цена для модалки новых территорий',
                max_digits=10,
                null=True,
                verbose_name='Цена от (руб)',
            ),
        ),
    ]
