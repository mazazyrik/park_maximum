import { useState, useEffect, useRef } from 'react'
import { IMAGES, CAR_IMAGES } from '../../constants/images'
import { fetchTariffs } from '../../api'

const FALLBACK_TARIFFS = [
  {
    id: 'standard',
    label: 'Стандарт',
    price: '30 руб/км',
    extra: '+5 руб/км',
    cars: [
      { name: 'Hyundai Solaris', image: IMAGES.carSolaris },
      { name: 'Kia Rio', image: IMAGES.kiaRio },
      { name: 'Skoda Rapid', image: IMAGES.skodaRapid },
    ],
  },
  {
    id: 'comfort',
    label: 'Комфорт',
    price: '35 руб/км',
    extra: '+5 руб/км',
    cars: [
      { name: 'Hyundai Elantra', image: IMAGES.hyundaiElantra },
      { name: 'Belgee X50', image: IMAGES.belgeeX50 },
      { name: 'Chery Tiggo', image: IMAGES.cheryTiggo },
    ],
  },
  {
    id: 'comfort_plus',
    label: 'Комфорт +',
    price: '40 руб/км',
    extra: '+5 руб/км',
    cars: [
      { name: 'Toyota Camry', image: IMAGES.toyotaCamry },
      { name: 'Kia Optima', image: IMAGES.kiaOptima },
      { name: 'Chery Arrizo 8', image: IMAGES.cheryArrizo8 },
      { name: 'Belgee X70', image: IMAGES.belgeeX70 },
    ],
  },
  {
    id: 'minivan',
    label: 'Минивен',
    price: '50 руб/км',
    extra: '+5 руб/км',
    cars: [{ name: 'Mercedes Vito', image: IMAGES.mercedesVito }],
  },
  {
    id: 'minivan8',
    label: 'Минивен 8+',
    price: '70 руб/км',
    extra: '+5 руб/км',
    cars: [{ name: 'Mercedes Sprinter', image: IMAGES.mercedesSprinter }],
  },
]

function buildTariffsFromApi(apiData) {
  return apiData.map((t) => {
    const extraPerKm = t.cars.length > 0 ? parseFloat(t.cars[0].extra_price_per_km) : 0
    return {
      id: t.slug,
      label: t.name,
      price: `${parseFloat(t.price_per_km)} руб/км`,
      extra: extraPerKm > 0 ? `+${extraPerKm} руб/км` : '—',
      cars: t.cars.map((car) => ({
        name: car.name,
        image: car.photo_url || CAR_IMAGES[car.name] || null,
      })),
    }
  })
}

const ArrowBtn = ({ dir, onClick }) => (
  <button type='button' onClick={onClick} className={`tariff-arrow tariff-arrow--${dir}`}>
    {dir === 'left' ? '‹' : '›'}
  </button>
)

export default function Tariffs() {
  const [tariffs, setTariffs] = useState(FALLBACK_TARIFFS)
  const [activeTabIdx, setActiveTabIdx] = useState(0)
  const [carIdx, setCarIdx] = useState(0)
  const tabRefs = useRef({})

  useEffect(() => {
    fetchTariffs()
      .then((data) => {
        if (data.length > 0) setTariffs(buildTariffsFromApi(data))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const tabEl = tabRefs.current[activeTabIdx]
    if (tabEl) {
      tabEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [activeTabIdx])

  const tariff = tariffs[activeTabIdx]
  const car = tariff.cars[carIdx]

  function switchTab(idx) {
    setActiveTabIdx(idx)
    setCarIdx(0)
  }

  function prevTab() {
    switchTab((activeTabIdx - 1 + tariffs.length) % tariffs.length)
  }

  function nextTab() {
    switchTab((activeTabIdx + 1) % tariffs.length)
  }

  function prevCar() {
    setCarIdx((i) => (i - 1 + tariff.cars.length) % tariff.cars.length)
  }

  function nextCar() {
    setCarIdx((i) => (i + 1) % tariff.cars.length)
  }

  return (
    <section className='section-block tariffs-section' id='tariffs'>
      <div className='container-inner'>
        <h2 className='section-title'>Тарифы</h2>

        <div className='tariff-tabs-bar'>
          <button type='button' onClick={prevTab} className='tariff-tabs-arrow'>‹</button>

          <div className='tariff-tabs-scroll'>
            {tariffs.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => { tabRefs.current[i] = el }}
                type='button'
                onClick={() => switchTab(i)}
                className={`tariff-tab ${activeTabIdx === i ? 'tariff-tab--active' : ''}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button type='button' onClick={nextTab} className='tariff-tabs-arrow'>›</button>
        </div>

        <div className='tariff-card'>
          <div className='tariff-gallery'>
            <div className='tariff-photo-wrap'>
              {car.image ? (
                <img
                  key={`${activeTabIdx}-${carIdx}`}
                  src={car.image}
                  alt={car.name}
                  className='tariff-photo'
                  loading='lazy'
                  decoding='async'
                />
              ) : (
                <span className='tariff-photo-placeholder'>{car.name}</span>
              )}
            </div>

            {tariff.cars.length > 1 && (
              <>
                <ArrowBtn dir='left' onClick={prevCar} />
                <ArrowBtn dir='right' onClick={nextCar} />
              </>
            )}

            {tariff.cars.length > 1 && (
              <div className='tariff-dots'>
                {tariff.cars.map((_, i) => (
                  <button
                    key={i}
                    type='button'
                    onClick={() => setCarIdx(i)}
                    className={`tariff-dot ${i === carIdx ? 'tariff-dot--active' : ''}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className='tariff-info'>
            <div>
              <p className='tariff-info-label'>{tariff.label}</p>
              <h3 className='tariff-info-title'>{car.name}</h3>
              {tariff.cars.length > 1 && (
                <p className='tariff-info-count'>{carIdx + 1} / {tariff.cars.length}</p>
              )}
            </div>

            <p className='tariff-info-line'>
              Цена за 1км пути <span>{tariff.price}</span>
            </p>
            <p className='tariff-info-line'>
              Выбор конкретного автомобиля <span>{tariff.extra}</span>
            </p>

            <a href='/calculator' className='btn-primary tariff-order-btn'>
              Заказать
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
