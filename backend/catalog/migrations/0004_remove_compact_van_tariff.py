from django.db import migrations


def remove_compact_van_tariff(apps, schema_editor):
    Tariff = apps.get_model('catalog', 'Tariff')
    Order = apps.get_model('orders', 'Order')

    compact_van = Tariff.objects.filter(slug='compact_van').first()
    if not compact_van:
        return

    comfort_plus = Tariff.objects.filter(slug='comfort_plus').first()
    if comfort_plus:
        Order.objects.filter(tariff=compact_van).update(tariff=comfort_plus)
    else:
        Order.objects.filter(tariff=compact_van).update(tariff=None)

    compact_van.delete()


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0003_remove_business_tariff'),
    ]

    operations = [
        migrations.RunPython(remove_compact_van_tariff, migrations.RunPython.noop),
    ]
