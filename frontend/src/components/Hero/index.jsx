import heroCar from '../../assets/images/hero-car.png'

export default function Hero() {
  return (
    <section
      className='w-full flex items-center'
      style={{
        backgroundColor: '#fff',
        height: '513px',
      }}
    >
      <div className='w-full max-w-[1440px] mx-auto px-[50px] flex items-center h-full'>
        <div className='flex-1 flex flex-col justify-center'>
          <p
            className='italic font-light'
            style={{ color: '#5B5B5B', fontSize: '22px', marginBottom: '16px' }}
          >
            Много лет на рынке
          </p>
          <h1
            className='font-black leading-tight'
            style={{ color: '#282828', fontSize: '56px', lineHeight: '1.1' }}
          >
            Максимум комфорта<br />
            на любых расстояниях
          </h1>
        </div>

        <div
          className='flex-shrink-0 flex items-center justify-end'
          style={{ width: '586px' }}
        >
          <img
            src={heroCar}
            alt='Автомобиль'
            style={{ width: '586px', height: '213px', objectFit: 'contain' }}
          />
        </div>
      </div>
    </section>
  )
}
