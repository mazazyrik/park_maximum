from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0004_remove_compact_van_tariff'),
    ]

    operations = [
        migrations.AddField(
            model_name='car',
            name='external_photo_url',
            field=models.URLField(blank=True, verbose_name='URL фото'),
        ),
    ]
