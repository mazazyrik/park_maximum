from django.db import migrations


def remove_business_tariff(apps, schema_editor):
    Tariff = apps.get_model('catalog', 'Tariff')
    Order = apps.get_model('orders', 'Order')

    business = Tariff.objects.filter(slug='business').first()
    if not business:
        return

    compact_van = Tariff.objects.filter(slug='compact_van').first()
    if compact_van:
        Order.objects.filter(tariff=business).update(tariff=compact_van)
    else:
        Order.objects.filter(tariff=business).update(tariff=None)

    business.delete()


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0002_territory_pricing'),
        ('orders', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(remove_business_tariff, migrations.RunPython.noop),
    ]
