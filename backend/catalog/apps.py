from django.apps import AppConfig


class CatalogConfig(AppConfig):
    name = 'catalog'

    def ready(self):
        from django.db.models.signals import post_migrate
        post_migrate.connect(_seed_on_migrate, sender=self)


def _seed_on_migrate(sender, **kwargs):
    try:
        from catalog.models import Tariff
        if Tariff.objects.exists():
            return
        from django.core.management import call_command
        call_command('seed_data', verbosity=0)
    except Exception:
        pass
