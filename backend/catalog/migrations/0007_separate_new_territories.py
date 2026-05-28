from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0006_popularroute_from_price'),
    ]

    operations = [
        migrations.CreateModel(
            name='NewTerritoryRoute',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('from_city', models.CharField(default='Москва', max_length=100, verbose_name='Откуда')),
                ('to_city', models.CharField(max_length=100, verbose_name='Куда')),
                ('from_price', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Цена от (руб)')),
                ('is_active', models.BooleanField(default=True, verbose_name='Активен')),
                ('sort_order', models.PositiveIntegerField(default=0, verbose_name='Порядок')),
            ],
            options={
                'verbose_name': 'Маршрут новой территории',
                'verbose_name_plural': 'Новые территории',
                'ordering': ['sort_order'],
            },
        ),
        migrations.DeleteModel(
            name='RoutePrice',
        ),
        migrations.RemoveField(
            model_name='popularroute',
            name='from_price',
        ),
        migrations.RemoveField(
            model_name='popularroute',
            name='is_new_territory',
        ),
        migrations.RemoveField(
            model_name='tariff',
            name='new_territory_price_per_km',
        ),
        migrations.DeleteModel(
            name='NewTerritoryCity',
        ),
    ]
