from decimal import Decimal

from decouple import config
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from catalog.models import Tariff, Car, PopularRoute, RoutePrice, NewTerritoryCity


STATIC_CDN_BASE = config(
    'STATIC_CDN_BASE',
    default='https://cdn.jsdelivr.net/gh/mazazyrik/park_maximum@main/frontend/src/assets/images',
)

CAR_PHOTO_FILES = {
    'Hyundai Solaris': 'car-solaris.webp',
    'Kia Rio': 'kia-rio.webp',
    'Skoda Rapid': 'skoda-rapid.webp',
    'Hyundai Elantra': 'hyundai-elantra.webp',
    'Belgee X50': 'belgee-x50.webp',
    'Chery Tiggo': 'chery-tiggo.webp',
    'Toyota Camry': 'toyota-camry.webp',
    'Kia Optima': 'kia-optima.webp',
    'Belgee X70': 'belgee-x70.webp',
    'Chery Arrizo 8': 'chery-arrizo8.webp',
    'Mercedes Vito': 'mercedes-vito.webp',
    'Mercedes Sprinter': 'mercedes-sprinter.webp',
}

NEW_TERRITORY_CITIES = ['Луганск', 'Донецк']


def car_photo_url(name):
    file_name = CAR_PHOTO_FILES.get(name)
    if not file_name:
        return ''
    return f'{STATIC_CDN_BASE}/{file_name}'


TARIFFS_DATA = [
    {
        'name': 'Стандарт',
        'slug': 'standard',
        'price_per_km': 30,
        'new_territory_price_per_km': 100,
        'sort_order': 1,
        'cars': [
            {'name': 'Hyundai Solaris', 'extra_price_per_km': 5, 'sort_order': 1},
            {'name': 'Kia Rio', 'extra_price_per_km': 5, 'sort_order': 2},
            {'name': 'Skoda Rapid', 'extra_price_per_km': 5, 'sort_order': 3},
        ],
    },
    {
        'name': 'Комфорт',
        'slug': 'comfort',
        'price_per_km': 35,
        'new_territory_price_per_km': 100,
        'sort_order': 2,
        'cars': [
            {'name': 'Hyundai Elantra', 'extra_price_per_km': 5, 'sort_order': 1},
            {'name': 'Belgee X50', 'extra_price_per_km': 5, 'sort_order': 2},
            {'name': 'Chery Tiggo', 'extra_price_per_km': 5, 'sort_order': 3},
        ],
    },
    {
        'name': 'Комфорт +',
        'slug': 'comfort_plus',
        'price_per_km': 40,
        'new_territory_price_per_km': 100,
        'sort_order': 3,
        'cars': [
            {'name': 'Toyota Camry', 'extra_price_per_km': 5, 'sort_order': 1},
            {'name': 'Kia Optima', 'extra_price_per_km': 5, 'sort_order': 2},
            {'name': 'Chery Arrizo 8', 'extra_price_per_km': 5, 'sort_order': 3},
            {'name': 'Belgee X70', 'extra_price_per_km': 5, 'sort_order': 4},
        ],
    },
    {
        'name': 'Минивен',
        'slug': 'minivan',
        'price_per_km': 50,
        'new_territory_price_per_km': 150,
        'sort_order': 4,
        'cars': [
            {'name': 'Mercedes Vito', 'extra_price_per_km': 5, 'sort_order': 1},
        ],
    },
    {
        'name': 'Минивен 8+',
        'slug': 'minivan8',
        'price_per_km': 70,
        'new_territory_price_per_km': 150,
        'sort_order': 5,
        'cars': [
            {'name': 'Mercedes Sprinter', 'extra_price_per_km': 5, 'sort_order': 1},
        ],
    },
]

ROUTES_DATA = [
    {
        'from_city': 'Москва',
        'to_city': 'Луганск',
        'sort_order': 1,
        'is_new_territory': True,
        'distance_km': 1100,
    },
    {
        'from_city': 'Москва',
        'to_city': 'Донецк',
        'sort_order': 2,
        'is_new_territory': True,
        'distance_km': 1070,
    },
    {
        'from_city': 'Москва',
        'to_city': 'Ростов',
        'sort_order': 3,
        'is_new_territory': False,
        'distance_km': 1080,
    },
    {
        'from_city': 'Москва',
        'to_city': 'Краснодарский край',
        'sort_order': 4,
        'is_new_territory': False,
        'distance_km': 1350,
    },
    {
        'from_city': 'Москва',
        'to_city': 'Санкт-Петербург',
        'sort_order': 5,
        'is_new_territory': False,
        'distance_km': 710,
    },
    {
        'from_city': 'Москва',
        'to_city': 'Крым',
        'sort_order': 6,
        'is_new_territory': False,
        'distance_km': 1550,
    },
]


def route_price(tariff, distance_km, is_new_territory):
    if is_new_territory:
        rate = tariff.new_territory_price_per_km
        if rate is None:
            rate = Decimal('150') if tariff.slug in ('minivan', 'minivan8') else Decimal('100')
    else:
        rate = tariff.price_per_km
    return int(distance_km * rate)


class Command(BaseCommand):
    help = 'Seed catalog data, pricing and admin user'

    def add_arguments(self, parser):
        parser.add_argument('--force', action='store_true', help='Пересоздать данные если уже есть')

    def handle(self, *args, **options):
        force = options['force']

        if force:
            Tariff.objects.all().delete()
            PopularRoute.objects.all().delete()

        self._seed_admin()
        tariff_map = self._seed_tariffs()
        self._seed_routes(tariff_map)
        self._seed_new_territory_cities()
        self._cleanup_orphan_tariffs()

        self.stdout.write(self.style.SUCCESS('Готово!'))

    def _seed_admin(self):
        username = config('DJANGO_SUPERUSER_USERNAME', default='admin')
        email = config('DJANGO_SUPERUSER_EMAIL', default='admin@parkmaximum.ru')
        password = config('DJANGO_SUPERUSER_PASSWORD', default='')

        if not password:
            self.stdout.write(self.style.WARNING('DJANGO_SUPERUSER_PASSWORD не задан, админ не обновлён'))
            return

        User = get_user_model()
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'is_staff': True,
                'is_superuser': True,
            },
        )
        user.email = email
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()

        if created:
            self.stdout.write(f'Админ создан: {username}')
        else:
            self.stdout.write(f'Админ обновлён: {username}')

    def _seed_tariffs(self):
        tariff_map = {}

        for t_data in TARIFFS_DATA:
            cars_data = t_data.pop('cars')
            tariff, _ = Tariff.objects.update_or_create(
                slug=t_data['slug'],
                defaults=t_data,
            )
            tariff_map[tariff.slug] = tariff

            for car_data in cars_data:
                Car.objects.update_or_create(
                    tariff=tariff,
                    name=car_data['name'],
                    defaults={
                        **car_data,
                        'external_photo_url': car_photo_url(car_data['name']),
                    },
                )

            t_data['cars'] = cars_data

        self.stdout.write(f'Тарифы: {len(tariff_map)}')
        return tariff_map

    def _seed_routes(self, tariff_map):
        for r_data in ROUTES_DATA:
            distance_km = r_data.pop('distance_km')
            is_new_territory = r_data.pop('is_new_territory')

            route, _ = PopularRoute.objects.update_or_create(
                from_city=r_data['from_city'],
                to_city=r_data['to_city'],
                defaults={
                    **r_data,
                    'is_new_territory': is_new_territory,
                },
            )

            for tariff in tariff_map.values():
                price = route_price(tariff, distance_km, is_new_territory)
                RoutePrice.objects.update_or_create(
                    route=route,
                    tariff=tariff,
                    defaults={'price': price},
                )

            r_data['distance_km'] = distance_km
            r_data['is_new_territory'] = is_new_territory

        self.stdout.write(f'Маршруты: {len(ROUTES_DATA)}')

    def _seed_new_territory_cities(self):
        for name in NEW_TERRITORY_CITIES:
            NewTerritoryCity.objects.update_or_create(
                name=name,
                defaults={'is_active': True},
            )
        self.stdout.write(f'Города новых территорий: {len(NEW_TERRITORY_CITIES)}')

    def _cleanup_orphan_tariffs(self):
        valid_slugs = [t['slug'] for t in TARIFFS_DATA]
        deleted, _ = Tariff.objects.exclude(slug__in=valid_slugs).delete()
        if deleted:
            self.stdout.write(f'Удалены лишние тарифы: {deleted}')
