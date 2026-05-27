export default function Cta() {
  return (
    <section className='section-block cta-section' id='calc'>
      <div className='container-inner cta-inner'>
        <p className='cta-text'>
          Наша задача — подобрать подходящего водителя
          <br className='cta-break' />
          под ваш маршрут, пожелания и формат поездки.
        </p>

        <a href='/calculator' className='btn-secondary cta-btn'>
          Рассчитать стоимость
        </a>
      </div>
    </section>
  )
}
