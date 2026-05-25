import logoLight from '../../assets/images/logo-light.png'

export default function About() {
  return (
    <section
      className='w-full'
      style={{ backgroundColor: '#fff', padding: '80px 50px' }}
      id='about'
    >
      <div className='max-w-[1340px] mx-auto'>
        <div
          style={{
            border: '1px solid #D9D9D9',
            borderLeft: '6px solid #FEDA00',
            borderRadius: '4px',
            padding: '40px 50px',
            display: 'flex',
            flexDirection: 'column',
            gap: '40px',
          }}
        >
          <h2
            style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#282828',
            }}
          >
            О компании
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '60px' }}>
            <div style={{ flexShrink: 0 }}>
              <img
                src={logoLight}
                alt='Максимум'
                style={{ width: '456px', height: '116px', objectFit: 'contain' }}
              />
            </div>

            <p
              style={{
                fontSize: '20px',
                color: '#282828',
                lineHeight: '1.6',
                maxWidth: '600px',
              }}
            >
              Мы — сервис по подбору водителей и экипажей для междугородних
              поездок. Уже не первый год помогаем пассажирам находить
              комфортные и безопасные решения для поездок между городами
              без лишних сложностей и долгого поиска.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '30px' }}>
            <a
              href='/calculator'
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '300px',
                height: '85px',
                borderRadius: '20px',
                fontSize: '22px',
                fontWeight: '800',
                fontFamily: 'inherit',
                textDecoration: 'none',
                backgroundColor: '#282828',
                color: '#FEDA00',
              }}
            >
              Заказать
            </a>
            <a
              href='/calculator'
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '491px',
                height: '85px',
                borderRadius: '20px',
                fontSize: '22px',
                fontWeight: '700',
                fontFamily: 'inherit',
                textDecoration: 'none',
                backgroundColor: '#282828',
                color: '#fff',
              }}
            >
              Расчитать стоимость
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
