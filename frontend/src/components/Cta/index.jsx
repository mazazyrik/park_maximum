export default function Cta() {
  return (
    <section
      style={{ backgroundColor: '#fff', padding: '80px 50px' }}
      id='calc'
    >
      <div
        style={{
          maxWidth: '1340px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '48px',
        }}
      >
        <p
          style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#282828',
            lineHeight: '1.4',
            maxWidth: '900px',
          }}
        >
          Наша задача — подобрать подходящего водителя
          <br />
          под ваш маршрут, пожелания и формат поездки.
        </p>

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
          Рассчитать стоимость
        </a>
      </div>
    </section>
  )
}
