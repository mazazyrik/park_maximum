from orders.models import Order


def get_status_label(status):
    return dict(Order.STATUS_CHOICES).get(status, status)


def format_admin_name(user):
    if user.username:
        return f'@{user.username}'
    parts = [user.first_name or '', user.last_name or '']
    name = ' '.join(part for part in parts if part).strip()
    return name or str(user.id)


def format_order_message(order, processed_by=None, action=None):
    docs = 'Да' if order.need_docs else 'Нет'
    car_line = f'\n🚗 <b>Автомобиль:</b> {order.car.name}' if order.car else ''
    tariff_name = order.tariff.name if order.tariff else '—'
    trip_date = order.trip_datetime.strftime('%d.%m.%Y %H:%M') if order.trip_datetime else '—'

    text = (
        f'🆕 <b>Новая заявка #{order.pk}</b>\n\n'
        f'👤 <b>ФИО:</b> {order.fio}\n'
        f'📞 <b>Телефон:</b> {order.phone}\n\n'
        f'📍 <b>Откуда:</b> {order.from_address}\n'
        f'🏁 <b>Куда:</b> {order.to_address}\n\n'
        f'📐 <b>Расстояние:</b> {order.distance_km} км\n'
        f'💰 <b>Стоимость:</b> {order.estimated_cost} руб\n'
        f'🏷 <b>Тариф:</b> {tariff_name}'
        f'{car_line}\n'
        f'🗓 <b>Дата поездки:</b> {trip_date}\n'
        f'📄 <b>Отч. документы:</b> {docs}'
    )

    if action and processed_by:
        action_label = 'Принята' if action == 'accept' else 'Отклонена'
        text += (
            f'\n\n<b>Статус:</b> {action_label}\n'
            f'👤 <b>Обработал:</b> {processed_by}'
        )
    elif order.status != Order.STATUS_NEW:
        text = text.replace('🆕 <b>Новая заявка', '📋 <b>Заявка')
        text += f'\n\n<b>Статус:</b> {get_status_label(order.status)}'

    return text


def format_orders_list(orders):
    if not orders:
        return '📋 <b>Последние заявки</b>\n\nЗаявок пока нет.'

    lines = ['📋 <b>Последние заявки</b>\n']
    for order in orders:
        route = f'{order.from_address[:25]} → {order.to_address[:25]}'
        created = order.created_at.strftime('%d.%m.%Y %H:%M')
        lines.append(
            f'#{order.pk} | {route}\n'
            f'{order.fio} | {order.phone}\n'
            f'{get_status_label(order.status)} | {created}\n'
        )
    return '\n'.join(lines)


def format_admins_list(admins):
    if not admins:
        return '👥 <b>Администраторы</b>\n\nСписок пуст.'

    lines = ['👥 <b>Администраторы</b>\n']
    for index, admin in enumerate(admins, start=1):
        label = f'@{admin.username}' if admin.username else admin.full_name or str(admin.user_id)
        added = admin.added_at.strftime('%d.%m.%Y')
        lines.append(f'{index}. {label} (id: {admin.user_id}) — добавлен {added}')
    return '\n'.join(lines)
