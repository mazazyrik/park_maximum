import { Link, useLocation } from 'react-router-dom'
import logoDark from '../../assets/images/logo-dark.png'
import iconMail from '../../assets/images/icon-mail.png'
import iconTelegram from '../../assets/images/icon-telegram.png'

export default function Header() {
  const { pathname } = useLocation()
  const isCalc = pathname === '/calculator'

  const hashLink = (hash) => isCalc ? `/${hash}` : hash

  return (
    <header
      className='fixed top-0 left-0 right-0 z-50 flex items-center'
      style={{ backgroundColor: '#282828', height: '153px' }}
    >
      <div className='w-full max-w-[1440px] mx-auto px-[50px] flex items-center justify-between'>
        <Link to='/' className='flex-shrink-0'>
          <img src={logoDark} alt='Максимум' style={{ height: '128px', width: '333px', objectFit: 'contain' }} />
        </Link>

        <nav className='flex items-center gap-[60px]'>
          <Link to='/' className='text-white font-normal text-[22px] hover:text-yellow transition-colors'>
            Главная
          </Link>
          <a href={hashLink('#routes')} className='text-white font-normal text-[22px] hover:text-yellow transition-colors'>
            Маршруты
          </a>
          <a href={hashLink('#tariffs')} className='text-white font-normal text-[22px] hover:text-yellow transition-colors'>
            Тарифы
          </a>
          <Link to='/calculator' className='text-white font-normal text-[22px] hover:text-yellow transition-colors'>
            Калькулятор
          </Link>
        </nav>

        <div className='flex items-center gap-[24px]'>
          <span className='text-white font-semibold text-[22px] whitespace-nowrap'>
            +7 (999) 999 99-99
          </span>
          <a href='mailto:name@mail.ru' className='flex-shrink-0'>
            <img src={iconMail} alt='Email' style={{ width: '50px', height: '50px' }} />
          </a>
          <a href='https://t.me/' className='flex-shrink-0' target='_blank' rel='noreferrer'>
            <img src={iconTelegram} alt='Telegram' style={{ width: '50px', height: '50px' }} />
          </a>
        </div>
      </div>
    </header>
  )
}
