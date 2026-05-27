import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { IMAGES } from '../../constants/images'
import { PHONE_DISPLAY, PHONE_HREF, TELEGRAM_URL } from '../../constants/contacts'

const NAV_ITEMS = [
  { type: 'link', to: '/', label: 'Главная' },
  { type: 'hash', hash: '#routes', label: 'Маршруты' },
  { type: 'hash', hash: '#tariffs', label: 'Тарифы' },
  { type: 'link', to: '/calculator', label: 'Калькулятор' },
]

function NavLinks({ isCalc, onNavigate, className = '' }) {
  const hashLink = (hash) => (isCalc ? `/${hash}` : hash)

  return (
    <nav className={`header-nav ${className}`.trim()}>
      {NAV_ITEMS.map((item) => {
        if (item.type === 'link') {
          return (
            <Link
              key={item.label}
              to={item.to}
              onClick={onNavigate}
              className='header-nav-link'
            >
              {item.label}
            </Link>
          )
        }

        return (
          <a
            key={item.label}
            href={hashLink(item.hash)}
            onClick={onNavigate}
            className='header-nav-link'
          >
            {item.label}
          </a>
        )
      })}
    </nav>
  )
}

function Contacts({ compact = false }) {
  return (
    <div className={`header-contacts ${compact ? 'header-contacts--compact' : ''}`.trim()}>
      <a href={PHONE_HREF} className='header-phone'>
        {PHONE_DISPLAY}
      </a>
      <a href='mailto:name@mail.ru' className='header-icon-link'>
        <img src={IMAGES.iconMail} alt='Email' className='header-icon' loading='lazy' decoding='async' />
      </a>
      <a href={TELEGRAM_URL} className='header-icon-link' target='_blank' rel='noreferrer'>
        <img src={IMAGES.iconTelegram} alt='Telegram' className='header-icon' loading='lazy' decoding='async' />
      </a>
    </div>
  )
}

export default function Header() {
  const { pathname } = useLocation()
  const isCalc = pathname === '/calculator'
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header className='site-header'>
      <div className='site-header-inner'>
        <Link to='/' className='header-logo'>
          <img src={IMAGES.logoDark} alt='Максимум' className='header-logo-img' fetchPriority='high' decoding='async' />
        </Link>

        <div className='header-nav-wrap header-nav-wrap--desktop'>
          <NavLinks isCalc={isCalc} />
        </div>

        <div className='header-contacts header-contacts--desktop'>
          <Contacts />
        </div>

        <div className='header-mobile-bar'>
          <Contacts compact />
          <button
            type='button'
            className='header-burger'
            aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className='site-header-nav-row'>
        <NavLinks isCalc={isCalc} />
      </div>

      {menuOpen && (
        <div className='header-mobile-menu'>
          <NavLinks isCalc={isCalc} onNavigate={() => setMenuOpen(false)} className='header-nav--mobile' />
        </div>
      )}
    </header>
  )
}
