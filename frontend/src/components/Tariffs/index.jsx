import { useState, useEffect } from 'react'
import { fetchTariffs } from '../../api'

import carSolaris from '../../assets/images/car-solaris.png'
import kiaRio from '../../assets/images/kia-rio.jpg'
import skodaRapid from '../../assets/images/skoda-rapid.jpg'
import hyundaiElantra from '../../assets/images/hyundai-elantra.jpg'
import belgeeX50 from '../../assets/images/belgee-x50.jpg'
import cheryTiggo from '../../assets/images/chery-tiggo.jpg'
import toyotaCamry from '../../assets/images/toyota-camry.jpg'
import kiaOptima from '../../assets/images/kia-optima.jpg'
import belgeeX70 from '../../assets/images/belgee-x70.jpg'
import cheryArrizo8 from '../../assets/images/chery-arrizo8.jpg'
import mercedesE from '../../assets/images/mercedes-e.jpg'
import bmw5 from '../../assets/images/bmw-5.jpg'
import mercedesVito from '../../assets/images/mercedes-vito.jpg'
import mercedesSprinter from '../../assets/images/mercedes-sprinter.jpg'

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
  'Mercedes E-Class': mercedesE,
  'BMW 5 Series': bmw5,
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
    price: '40 руб/км',
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
    price: '55 руб/км',
    extra: '+5 руб/км',
    cars: [
      { name: 'Toyota Camry', image: toyotaCamry },
      { name: 'Kia Optima', image: kiaOptima },
      { name: 'Chery Arrizo 8', image: cheryArrizo8 },
      { name: 'Belgee X70', image: belgeeX70 },
    ],
  },
  {
    id: 'business',
    label: 'Бизнес',
    price: '65 руб/км',
    extra: '+5 руб/км',
    cars: [
      { name: 'Mercedes E-Class', image: mercedesE },
      { name: 'BMW 5 Series', image: bmw5 },
    ],
  },
  {
    id: 'minivan',
    label: 'Минивен',
    price: '60 руб/км',
    extra: '+5 руб/км',
    cars: [{ name: 'Mercedes Vito', image: mercedesVito }],
  },
  {
    id: 'minivan8',
    label: 'Минивен 8+',
    price: '80 руб/км',
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
  <button
    onClick={onClick}
    style={{
      position: 'absolute',
      [dir === 'left' ? 'left' : 'right']: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'rgba(255,255,255,0.75)',
      border: 'none',
      borderRadius: '50%',
      width: '52px',
      height: '52px',
      cursor: 'pointer',
      fontSize: '30px',
      color: '#282828',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '300',
      lineHeight: 1,
      transition: 'background 0.2s',
      zIndex: 2,
    }}
  >
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
    <section style={{ backgroundColor: '#fff', padding: '60px 50px' }} id='tariffs'>
      <div style={{ maxWidth: '1340px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: '40px',
            fontWeight: '800',
            color: '#282828',
            marginBottom: '40px',
          }}
        >
          Тарифы
        </h2>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0',
            borderBottom: '2px solid #e0e0e0',
            marginBottom: '40px',
          }}
        >
          <button
            onClick={prevTab}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '28px',
              color: '#282828',
              padding: '0 12px 12px',
              marginBottom: '-2px',
              lineHeight: 1,
            }}
          >
            ‹
          </button>

          {tariffs.map((t, i) => (
            <button
              key={t.id}
              onClick={() => switchTab(i)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '22px',
                fontWeight: '800',
                color: '#282828',
                padding: '0 20px 12px',
                borderBottom: activeTabIdx === i ? '3px solid #282828' : '3px solid transparent',
                marginBottom: '-2px',
                transition: 'border-color 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </button>
          ))}

          <button
            onClick={nextTab}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '28px',
              color: '#282828',
              padding: '0 12px 12px',
              marginBottom: '-2px',
              lineHeight: 1,
            }}
          >
            ›
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '60px',
            backgroundColor: '#D9D9D9',
            borderRadius: '20px',
            padding: '40px 50px',
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative', width: '608px', flexShrink: 0 }}>
            <div
              style={{
                width: '608px',
                height: '405px',
                backgroundColor: '#fff',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {car.image ? (
                <img
                  key={`${activeTabIdx}-${carIdx}`}
                  src={car.image}
                  alt={car.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ color: '#aaa', fontSize: '16px' }}>{car.name}</span>
              )}
            </div>

            {tariff.cars.length > 1 && (
              <>
                <ArrowBtn dir='left' onClick={prevCar} />
                <ArrowBtn dir='right' onClick={nextCar} />
              </>
            )}

            {tariff.cars.length > 1 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '6px',
                }}
              >
                {tariff.cars.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCarIdx(i)}
                    style={{
                      width: i === carIdx ? '24px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      background: i === carIdx ? '#282828' : 'rgba(40,40,40,0.3)',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.25s',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <p style={{ fontSize: '18px', color: '#5B5B5B', marginBottom: '4px' }}>
                {tariff.label}
              </p>
              <h3 style={{ fontSize: '32px', fontWeight: '800', color: '#282828' }}>
                {car.name}
              </h3>
              {tariff.cars.length > 1 && (
                <p style={{ fontSize: '16px', color: '#5B5B5B', marginTop: '4px' }}>
                  {carIdx + 1} / {tariff.cars.length}
                </p>
              )}
            </div>

            <p style={{ fontSize: '20px', color: '#282828' }}>
              Цена за 1км пути{' '}
              <span style={{ fontWeight: '800' }}>{tariff.price}</span>
            </p>
            <p style={{ fontSize: '20px', color: '#282828' }}>
              Выбор конкретного автомобиля{' '}
              <span style={{ fontWeight: '800' }}>{tariff.extra}</span>
            </p>

            <a
              href='/calculator'
              style={{
                alignSelf: 'flex-start',
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
                marginTop: '8px',
              }}
            >
              Заказать
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
