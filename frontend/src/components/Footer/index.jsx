import { IMAGES } from '../../constants/images'
import { PHONE_DISPLAY, PHONE_HREF, TELEGRAM_URL } from '../../constants/contacts'

export default function Footer() {
  return (
    <footer className='site-footer'>
      <div className='site-footer-inner'>
        <div className='site-footer-contacts'>
          <a href='mailto:name@mail.ru' className='header-icon-link'>
            <img src={IMAGES.iconMail} alt='Email' className='header-icon' loading='lazy' decoding='async' />
          </a>
          <a href={TELEGRAM_URL} target='_blank' rel='noreferrer' className='header-icon-link'>
            <img src={IMAGES.iconTelegram} alt='Telegram' className='header-icon' loading='lazy' decoding='async' />
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
