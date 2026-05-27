from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='tariff',
            name='new_territory_price_per_km',
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                max_digits=8,
                null=True,
                verbose_name='Цена за км — новые территории (руб)',
            ),
        ),
        migrations.AddField(
            model_name='popularroute',
            name='is_new_territory',
            field=models.BooleanField(default=False, verbose_name='Новая территория'),
        ),
        migrations.CreateModel(
            name='NewTerritoryCity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True, verbose_name='Город')),
                ('is_active', models.BooleanField(default=True, verbose_name='Активен')),
            ],
            options={
                'verbose_name': 'Город новой территории',
                'verbose_name_plural': 'Города новых территорий',
                'ordering': ['name'],
            },
        ),
    ]
