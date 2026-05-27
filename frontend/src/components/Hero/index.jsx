import { IMAGES } from '../../constants/images'

export default function Hero() {
  return (
    <section className='hero-section'>
      <div className='container hero-inner'>
        <div className='hero-content'>
          <p className='hero-subtitle'>Много лет на рынке</p>
          <h1 className='hero-title'>
            Максимум комфорта
            <br />
            на любых расстояниях
          </h1>
        </div>

        <div className='hero-image-wrap'>
          <img
            src={IMAGES.heroCar}
            alt='Автомобиль'
            className='hero-image'
            fetchPriority='high'
            decoding='async'
          />
        </div>
      </div>
    </section>
  )
}
