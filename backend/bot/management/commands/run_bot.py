import asyncio
import logging
import re
import sys

from asgiref.sync import sync_to_async
from django.conf import settings
from django.core.management.base import BaseCommand
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, KeyboardButton, ReplyKeyboardMarkup, Update
from telegram.constants import ParseMode
from telegram.error import BadRequest, Forbidden
from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

from bot.constants import (
    BTN_ADD_ADMIN,
    BTN_RECENT_ORDERS,
    BTN_REMOVE_ADMIN,
    BTN_VIEW_ADMINS,
    DEACTIVATE_ADMIN_PATTERN,
    ORDER_ACTION_PATTERN,
    WAITING_ADMIN_FORWARD_KEY,
)
from bot.formatting import (
    format_admin_name,
    format_admins_list,
    format_order_message,
    format_orders_list,
)
from bot.services import (
    add_or_activate_admin,
    deactivate_admin,
    get_active_admins,
    get_notification_recipient_ids,
    get_order_notifications,
    get_pending_order_notifications,
    get_recent_orders,
    is_bot_admin,
    is_master_admin,
    mark_notification_failed,
    mark_notification_permanently_failed,
    mark_notification_sent,
    process_order_action,
)

logger = logging.getLogger(__name__)


def build_order_keyboard(order_id):
    return InlineKeyboardMarkup(
        [
            [
                InlineKeyboardButton('✅ Принять', callback_data=f'accept_{order_id}'),
                InlineKeyboardButton('❌ Отклонить', callback_data=f'reject_{order_id}'),
            ],
        ]
    )


async def deliver_pending_notifications(application):
    notifications = await sync_to_async(get_pending_order_notifications)()
    for notification in notifications:
        try:
            message = await application.bot.send_message(
                chat_id=notification.telegram_user_id,
                text=format_order_message(notification.order),
                parse_mode=ParseMode.HTML,
                reply_markup=build_order_keyboard(notification.order_id),
            )
        except (BadRequest, Forbidden) as exc:
            logger.warning(
                'Permanent Telegram error for order %s notification %s: %s',
                notification.order_id,
                notification.pk,
                exc,
            )
            await sync_to_async(mark_notification_permanently_failed)(
                notification.pk,
                exc,
            )
            continue
        except Exception as exc:
            logger.warning(
                'Failed to send order %s notification %s: %s',
                notification.order_id,
                notification.pk,
                exc,
            )
            await sync_to_async(mark_notification_failed)(notification.pk, exc)
            continue

        await sync_to_async(mark_notification_sent)(
            notification.pk,
            message.message_id,
        )


async def notification_worker(application):
    while True:
        try:
            await deliver_pending_notifications(application)
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception('Order notification worker failed')
        await asyncio.sleep(3)


async def start_notification_worker(application):
    application.bot_data['notification_worker'] = asyncio.create_task(
        notification_worker(application)
    )


async def stop_notification_worker(application):
    task = application.bot_data.get('notification_worker')
    if not task:
        return
    task.cancel()
    await asyncio.gather(task, return_exceptions=True)


def build_menu_keyboard(user_id):
    rows = [[KeyboardButton(BTN_RECENT_ORDERS)]]
    if is_master_admin(user_id):
        rows.append([KeyboardButton(BTN_ADD_ADMIN)])
        rows.append([KeyboardButton(BTN_VIEW_ADMINS), KeyboardButton(BTN_REMOVE_ADMIN)])
    return ReplyKeyboardMarkup(rows, resize_keyboard=True, is_persistent=True)


def extract_forward_user(message):
    if message.forward_origin and getattr(message.forward_origin, 'sender_user', None):
        return message.forward_origin.sender_user
    return message.forward_from


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    if not await sync_to_async(is_bot_admin)(user.id):
        await update.message.reply_text(
            'Бот для отслеживания заказов Максимум Такси.\n'
            'Обратитесь к администратору для получения доступа.'
        )
        return

    keyboard = await sync_to_async(build_menu_keyboard)(user.id)
    await update.message.reply_text(
        'Бот для отслеживания заказов Максимум Такси.\n'
        'Выберите действие в меню.',
        reply_markup=keyboard,
    )


async def require_admin(update: Update):
    user = update.effective_user
    if not await sync_to_async(is_bot_admin)(user.id):
        if update.message:
            await update.message.reply_text('Нет доступа.')
        elif update.callback_query:
            await update.callback_query.answer('Нет доступа.', show_alert=True)
        return False
    return True


async def recent_orders(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await require_admin(update):
        return
    orders = await sync_to_async(get_recent_orders)()
    text = format_orders_list(orders)
    await update.message.reply_text(text, parse_mode=ParseMode.HTML)


async def add_admin_prompt(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await require_admin(update):
        return
    if not await sync_to_async(is_master_admin)(update.effective_user.id):
        await update.message.reply_text('Только мастер-админ может добавлять администраторов.')
        return
    context.user_data[WAITING_ADMIN_FORWARD_KEY] = True
    await update.message.reply_text(
        'Перешлите сообщение от пользователя, которого хотите добавить.'
    )


async def view_admins(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await require_admin(update):
        return
    if not await sync_to_async(is_master_admin)(update.effective_user.id):
        await update.message.reply_text('Только мастер-админ может просматривать администраторов.')
        return
    admins = await sync_to_async(get_active_admins)()
    text = format_admins_list(admins)
    await update.message.reply_text(text, parse_mode=ParseMode.HTML)


async def remove_admin_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await require_admin(update):
        return
    if not await sync_to_async(is_master_admin)(update.effective_user.id):
        await update.message.reply_text('Только мастер-админ может удалять администраторов.')
        return
    admins = await sync_to_async(get_active_admins)()
    if not admins:
        await update.message.reply_text('Активных администраторов нет.')
        return

    buttons = []
    for admin in admins:
        if admin.user_id == settings.TELEGRAM_MASTER_ADMIN_ID:
            continue
        label = f'❌ @{admin.username}' if admin.username else f'❌ {admin.full_name or admin.user_id}'
        buttons.append([InlineKeyboardButton(label, callback_data=f'deactivate_admin_{admin.user_id}')])

    if not buttons:
        await update.message.reply_text('Нет администраторов для удаления.')
        return

    await update.message.reply_text(
        'Выберите администратора для удаления:',
        reply_markup=InlineKeyboardMarkup(buttons),
    )


async def handle_forwarded_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.message:
        return
    if not await sync_to_async(is_master_admin)(update.effective_user.id):
        return
    if not context.user_data.get(WAITING_ADMIN_FORWARD_KEY):
        return

    context.user_data[WAITING_ADMIN_FORWARD_KEY] = False
    forward_user = extract_forward_user(update.message)
    if not forward_user:
        await update.message.reply_text(
            'Не удалось получить ID — у пользователя скрыт профиль.\n'
            'Попросите его написать /start боту или добавьте вручную: /addadmin <user_id>'
        )
        return

    admin, created = await sync_to_async(add_or_activate_admin)(
        forward_user.id,
        forward_user.username or '',
        ' '.join(filter(None, [forward_user.first_name, forward_user.last_name])),
    )
    label = f'@{admin.username}' if admin.username else admin.full_name or str(admin.user_id)
    action = 'добавлен' if created else 'обновлён'
    await update.message.reply_text(f'Администратор {label} {action}.')


async def addadmin_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await require_admin(update):
        return
    if not await sync_to_async(is_master_admin)(update.effective_user.id):
        await update.message.reply_text('Только мастер-админ может добавлять администраторов.')
        return
    if not context.args:
        await update.message.reply_text('Использование: /addadmin <user_id>')
        return

    try:
        user_id = int(context.args[0])
    except ValueError:
        await update.message.reply_text('Неверный user_id.')
        return

    admin, created = await sync_to_async(add_or_activate_admin)(user_id)
    action = 'добавлен' if created else 'обновлён'
    await update.message.reply_text(f'Администратор {admin.user_id} {action}.')


async def handle_menu_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text
    if text == BTN_RECENT_ORDERS:
        await recent_orders(update, context)
    elif text == BTN_ADD_ADMIN:
        await add_admin_prompt(update, context)
    elif text == BTN_VIEW_ADMINS:
        await view_admins(update, context)
    elif text == BTN_REMOVE_ADMIN:
        await remove_admin_menu(update, context)


async def handle_deactivate_admin(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query

    if not await sync_to_async(is_master_admin)(query.from_user.id):
        await query.answer('Только мастер-админ может удалять администраторов.', show_alert=True)
        return

    match = re.match(DEACTIVATE_ADMIN_PATTERN, query.data)
    if not match:
        await query.answer()
        return

    user_id = int(match.group(1))
    if user_id == settings.TELEGRAM_MASTER_ADMIN_ID:
        await query.answer('Мастер-админа нельзя удалить.', show_alert=True)
        return

    removed = await sync_to_async(deactivate_admin)(user_id)
    if removed:
        await query.edit_message_text(f'Администратор {user_id} удалён.')
    else:
        await query.edit_message_text('Администратор не найден или уже удалён.')
    await query.answer()


async def handle_order_action(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query

    if not await sync_to_async(is_bot_admin)(query.from_user.id):
        await query.answer('Нет доступа.', show_alert=True)
        return

    match = re.match(ORDER_ACTION_PATTERN, query.data)
    if not match:
        await query.answer()
        return

    action = match.group(1)
    order_id = int(match.group(2))

    order, status = await sync_to_async(process_order_action)(order_id, action)
    if status == 'already_processed':
        await query.answer('Заявка уже обработана.', show_alert=True)
        return
    if status != 'ok':
        await query.answer('Не удалось обработать заявку.', show_alert=True)
        return

    await query.answer('Готово.')
    admin_label = format_admin_name(query.from_user)
    processed_text = format_order_message(order, processed_by=admin_label, action=action)
    notifications = await sync_to_async(get_order_notifications)(order_id)
    recipient_ids = await sync_to_async(get_notification_recipient_ids)()

    for notification in notifications:
        try:
            await context.bot.delete_message(
                chat_id=notification.telegram_user_id,
                message_id=notification.message_id,
            )
        except Exception as exc:
            logger.warning('Failed to delete notification %s: %s', notification.pk, exc)

    for recipient_id in recipient_ids:
        try:
            await context.bot.send_message(
                chat_id=recipient_id,
                text=processed_text,
                parse_mode=ParseMode.HTML,
            )
        except Exception as exc:
            logger.warning('Failed to send processed order %s to %s: %s', order_id, recipient_id, exc)


class Command(BaseCommand):
    help = 'Run Telegram bot for order notifications'

    def handle(self, *args, **options):
        token = settings.TELEGRAM_BOT_TOKEN
        master_admin_id = settings.TELEGRAM_MASTER_ADMIN_ID
        if not token:
            self.stderr.write('TELEGRAM_BOT_TOKEN is not configured')
            sys.exit(1)

        if not master_admin_id:
            self.stderr.write('TELEGRAM_MASTER_ADMIN_ID is not configured')
            sys.exit(1)

        application_builder = (
            Application.builder()
            .token(token)
            .post_init(start_notification_worker)
            .post_shutdown(stop_notification_worker)
        )
        if settings.TELEGRAM_PROXY_URL:
            application_builder = application_builder.proxy(
                settings.TELEGRAM_PROXY_URL
            ).get_updates_proxy(settings.TELEGRAM_PROXY_URL)
        application = application_builder.build()

        application.add_handler(CommandHandler('start', start))
        application.add_handler(CommandHandler('addadmin', addadmin_command))
        application.add_handler(CallbackQueryHandler(handle_order_action, pattern=ORDER_ACTION_PATTERN))
        application.add_handler(CallbackQueryHandler(handle_deactivate_admin, pattern=DEACTIVATE_ADMIN_PATTERN))
        application.add_handler(MessageHandler(filters.FORWARDED, handle_forwarded_message))

        menu_pattern = (
            f'^({re.escape(BTN_RECENT_ORDERS)}|{re.escape(BTN_ADD_ADMIN)}|'
            f'{re.escape(BTN_VIEW_ADMINS)}|{re.escape(BTN_REMOVE_ADMIN)})$'
        )
        application.add_handler(MessageHandler(filters.Regex(menu_pattern) & filters.TEXT, handle_menu_message))

        self.stdout.write('Starting Telegram bot polling...')
        application.run_polling()
