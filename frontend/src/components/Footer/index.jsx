import iconMail from '../../assets/images/icon-mail.webp'
import iconTelegram from '../../assets/images/icon-telegram.webp'
import { PHONE_DISPLAY, PHONE_HREF, TELEGRAM_URL } from '../../constants/contacts'

export default function Footer() {
  return (
    <footer className='site-footer'>
      <div className='site-footer-inner'>
        <div className='site-footer-contacts'>
          <a href='mailto:name@mail.ru' className='header-icon-link'>
            <img src={iconMail} alt='Email' className='header-icon' />
          </a>
          <a href={TELEGRAM_URL} target='_blank' rel='noreferrer' className='header-icon-link'>
            <img src={iconTelegram} alt='Telegram' className='header-icon' />
          </a>
          <div className='site-footer-text'>
            <a href={PHONE_HREF} className='site-footer-line'>
              Телефон: {PHONE_DISPLAY}
            </a>
            <span className='site-footer-line'>Почта: name@mail.ru</span>
          </div>
        </div>

        <div className='site-footer-meta'>
          <span className='site-footer-line'>© Максимум</span>
          <a href='/privacy' className='site-footer-policy'>
            Политика конфиденциальности
          </a>
        </div>
      </div>
    </footer>
  )
}
