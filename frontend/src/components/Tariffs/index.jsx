import { useState, useEffect } from 'react'
import { fetchTariffs } from '../../api'

import carSolaris from '../../assets/images/car-solaris.webp'
import kiaRio from '../../assets/images/kia-rio.webp'
import skodaRapid from '../../assets/images/skoda-rapid.webp'
import hyundaiElantra from '../../assets/images/hyundai-elantra.webp'
import belgeeX50 from '../../assets/images/belgee-x50.webp'
import cheryTiggo from '../../assets/images/chery-tiggo.webp'
import toyotaCamry from '../../assets/images/toyota-camry.webp'
import kiaOptima from '../../assets/images/kia-optima.webp'
import belgeeX70 from '../../assets/images/belgee-x70.webp'
import cheryArrizo8 from '../../assets/images/chery-arrizo8.webp'
import mercedesVito from '../../assets/images/mercedes-vito.webp'
import mercedesSprinter from '../../assets/images/mercedes-sprinter.webp'

const LOCAL_IMAGES = {
  'Hyundai Solaris': carSolaris,
  'Kia Rio': kiaRio,
  'Skoda Rapid': skodaRapid,
  'Hyundai Elantra': hyundaiElantra,
  'Belgee X50': belgeeX50,
  'Chery Tiggo': cheryTiggo,
  'Toyota Camry': toyotaCamry,
  'Kia Optima': kiaOptima,
  'Belgee X70': belgeeX70,
  'Chery Arrizo 8': cheryArrizo8,
  'Mercedes Vito': mercedesVito,
  'Mercedes Sprinter': mercedesSprinter,
}

const FALLBACK_TARIFFS = [
  {
    id: 'standard',
    label: 'Стандарт',
    price: '30 руб/км',
    extra: '+5 руб/км',
    cars: [
      { name: 'Hyundai Solaris', image: carSolaris },
      { name: 'Kia Rio', image: kiaRio },
      { name: 'Skoda Rapid', image: skodaRapid },
    ],
  },
  {
    id: 'comfort',
    label: 'Комфорт',
    price: '35 руб/км',
    extra: '+5 руб/км',
    cars: [
      { name: 'Hyundai Elantra', image: hyundaiElantra },
      { name: 'Belgee X50', image: belgeeX50 },
      { name: 'Chery Tiggo', image: cheryTiggo },
    ],
  },
  {
    id: 'comfort_plus',
    label: 'Комфорт +',
    price: '40 руб/км',
    extra: '+5 руб/км',
    cars: [
      { name: 'Toyota Camry', image: toyotaCamry },
      { name: 'Kia Optima', image: kiaOptima },
      { name: 'Chery Arrizo 8', image: cheryArrizo8 },
      { name: 'Belgee X70', image: belgeeX70 },
    ],
  },
  {
    id: 'minivan',
    label: 'Минивен',
    price: '50 руб/км',
    extra: '+5 руб/км',
    cars: [{ name: 'Mercedes Vito', image: mercedesVito }],
  },
  {
    id: 'minivan8',
    label: 'Минивен 8+',
    price: '70 руб/км',
    extra: '+5 руб/км',
    cars: [{ name: 'Mercedes Sprinter', image: mercedesSprinter }],
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
        image: car.photo_url || LOCAL_IMAGES[car.name] || null,
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

  useEffect(() => {
    fetchTariffs()
      .then((data) => {
        if (data.length > 0) setTariffs(buildTariffsFromApi(data))
      })
      .catch(() => {})
  }, [])

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
