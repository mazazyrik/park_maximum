from django.core.management.base import BaseCommand
from catalog.models import Tariff, Car, PopularRoute, RoutePrice


TARIFFS_DATA = [
    {
        'name': 'Стандарт',
        'slug': 'standard',
        'price_per_km': 30,
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
        'price_per_km': 40,
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
        'price_per_km': 55,
        'sort_order': 3,
        'cars': [
            {'name': 'Toyota Camry', 'extra_price_per_km': 5, 'sort_order': 1},
            {'name': 'Kia Optima', 'extra_price_per_km': 5, 'sort_order': 2},
            {'name': 'Chery Arrizo 8', 'extra_price_per_km': 5, 'sort_order': 3},
            {'name': 'Belgee X70', 'extra_price_per_km': 5, 'sort_order': 4},
        ],
    },
    {
        'name': 'Бизнес',
        'slug': 'business',
        'price_per_km': 65,
        'sort_order': 4,
        'cars': [
            {'name': 'Mercedes E-Class', 'extra_price_per_km': 5, 'sort_order': 1},
            {'name': 'BMW 5 Series', 'extra_price_per_km': 5, 'sort_order': 2},
        ],
    },
    {
        'name': 'Минивен',
        'slug': 'minivan',
        'price_per_km': 60,
        'sort_order': 5,
        'cars': [
            {'name': 'Mercedes Vito', 'extra_price_per_km': 5, 'sort_order': 1},
        ],
    },
    {
        'name': 'Минивен 8+',
        'slug': 'minivan8',
        'price_per_km': 80,
        'sort_order': 6,
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
        'prices': {
            'standard': 33000,
            'comfort': 44000,
            'comfort_plus': 60500,
            'business': 71500,
            'minivan': 66000,
            'minivan8': 88000,
        },
    },
    {
        'from_city': 'Москва',
        'to_city': 'Донецк',
        'sort_order': 2,
        'prices': {
            'standard': 32100,
            'comfort': 42800,
            'comfort_plus': 58850,
            'business': 69550,
            'minivan': 64200,
            'minivan8': 85600,
        },
    },
    {
        'from_city': 'Москва',
        'to_city': 'Ростов',
        'sort_order': 3,
        'prices': {
            'standard': 32400,
            'comfort': 43200,
            'comfort_plus': 59400,
            'business': 70200,
            'minivan': 64800,
            'minivan8': 86400,
        },
    },
    {
        'from_city': 'Москва',
        'to_city': 'Краснодарский край',
        'sort_order': 4,
        'prices': {
            'standard': 40500,
            'comfort': 54000,
            'comfort_plus': 74250,
            'business': 87750,
            'minivan': 81000,
            'minivan8': 108000,
        },
    },
    {
        'from_city': 'Москва',
        'to_city': 'Санкт-Петербург',
        'sort_order': 5,
        'prices': {
            'standard': 21300,
            'comfort': 28400,
            'comfort_plus': 39050,
            'business': 46150,
            'minivan': 42600,
            'minivan8': 56800,
        },
    },
    {
        'from_city': 'Москва',
        'to_city': 'Крым',
        'sort_order': 6,
        'prices': {
            'standard': 46500,
            'comfort': 62000,
            'comfort_plus': 85250,
            'business': 100750,
            'minivan': 93000,
            'minivan8': 124000,
        },
    },
]


class Command(BaseCommand):
    help = 'Seed initial catalog data (tariffs, cars, routes, prices)'

    def add_arguments(self, parser):
        parser.add_argument('--force', action='store_true', help='Пересоздать данные если уже есть')

    def handle(self, *args, **options):
        force = options['force']

        if Tariff.objects.exists() and not force:
            self.stdout.write('Данные уже есть, пропускаю. Используй --force для перезаписи.')
            return

        if force:
            Tariff.objects.all().delete()
            PopularRoute.objects.all().delete()

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
                    defaults=car_data,
                )

            t_data['cars'] = cars_data

        self.stdout.write(f'Тарифы созданы: {len(tariff_map)}')

        for r_data in ROUTES_DATA:
            prices_data = r_data.pop('prices')
            route, _ = PopularRoute.objects.update_or_create(
                from_city=r_data['from_city'],
                to_city=r_data['to_city'],
                defaults=r_data,
            )

            for slug, price in prices_data.items():
                tariff = tariff_map.get(slug)
                if tariff:
                    RoutePrice.objects.update_or_create(
                        route=route,
                        tariff=tariff,
                        defaults={'price': price},
                    )

            r_data['prices'] = prices_data

        self.stdout.write(f'Маршруты созданы: {len(ROUTES_DATA)}')
        self.stdout.write(self.style.SUCCESS('Готово!'))
