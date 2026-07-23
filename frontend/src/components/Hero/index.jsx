import { Link } from 'react-router-dom'
import { IMAGES } from '../../constants/images'

export default function Hero() {
  return (
    <section className='hero-section'>
      <div className='container hero-inner'>
        <div className='hero-content'>
          <p className='hero-kicker'>Междугородние поездки по России</p>
          <h1 className='hero-title'>О компании</h1>
          <p className='hero-text'>
            Мы — сервис по подбору водителей и экипажей для междугородних
            поездок. Уже не первый год помогаем пассажирам находить
            комфортные и безопасные решения для поездок между городами
            без лишних сложностей и долгого поиска.
          </p>
          <div className='hero-actions'>
            <Link to='/calculator' className='btn-primary'>Заказать поездку</Link>
            <Link to='/calculator' className='btn-secondary'>Рассчитать стоимость</Link>
          </div>
        </div>

        <div className='hero-image-wrap'>
          <div className='hero-image-accent' aria-hidden='true' />
          <picture>
            <source
              media='(max-width: 767px)'
              type='image/avif'
              srcSet={IMAGES.heroRoadMobileAvif}
            />
            <source
              media='(max-width: 767px)'
              type='image/webp'
              srcSet={IMAGES.heroRoadMobileWebp}
            />
            <source type='image/avif' srcSet={IMAGES.heroRoadDesktopAvif} />
            <img
              src={IMAGES.heroRoadDesktopWebp}
              alt='Автомобиль в движении на лесной дороге'
              className='hero-image'
              decoding='async'
            />
          </picture>
        </div>
      </div>
    </section>
  )
}
