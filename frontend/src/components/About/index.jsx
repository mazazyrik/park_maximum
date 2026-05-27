import { IMAGES } from '../../constants/images'

export default function About() {
  return (
    <section className='section-block' id='about'>
      <div className='container-inner'>
        <div className='about-card'>
          <h2 className='about-title'>О компании</h2>

          <div className='about-body'>
            <div className='about-logo-wrap'>
              <img
                src={IMAGES.logoLight}
                alt='Максимум'
                className='about-logo'
                loading='lazy'
                decoding='async'
              />
            </div>

            <p className='about-text'>
              Мы — сервис по подбору водителей и экипажей для междугородних
              поездок. Уже не первый год помогаем пассажирам находить
              комфортные и безопасные решения для поездок между городами
              без лишних сложностей и долгого поиска.
            </p>
          </div>

          <div className='btn-row'>
            <a href='/calculator' className='btn-primary'>Заказать</a>
            <a href='/calculator' className='btn-secondary'>Расчитать стоимость</a>
          </div>
        </div>
      </div>
    </section>
  )
}
