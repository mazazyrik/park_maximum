import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { fetchTariffs } from '../../api'

const REGION_TITLES = {
  cfo: 'ЦФО',
  south: 'Юг-России',
}

const FALLBACK_TARIFFS = [
  { name: 'Стандарт', price_per_km: 30, extra: 5 },
  { name: 'Комфорт', price_per_km: 35, extra: 5 },
  { name: 'Комфорт +', price_per_km: 40, extra: 5 },
  { name: 'Минивен', price_per_km: 50, extra: 5 },
  { name: 'Минивен 8+', price_per_km: 70, extra: 5 },
]

function mapTariffs(data) {
  return data.map((t) => {
    const extras = (t.cars || []).map((car) => parseFloat(car.extra_price_per_km)).filter((v) => !Number.isNaN(v))
    const extra = extras.length > 0 ? Math.min(...extras) : 0
    return {
      name: t.name,
      price_per_km: parseFloat(t.price_per_km),
      extra,
    }
  })
}

function buildExtraText(tariffs) {
  const extras = tariffs.map((t) => t.extra).filter((v) => v > 0)
  if (extras.length === 0) return 'Выбор конкретного автомобиля может изменить стоимость поездки.'

  const minExtra = Math.min(...extras)
  const maxExtra = Math.max(...extras)

  if (minExtra === maxExtra) {
    return `Выбор конкретного автомобиля — дополнительно от +${minExtra} руб/км к тарифу.`
  }

  return `Выбор конкретного автомобиля — дополнительно от +${minExtra} до +${maxExtra} руб/км к тарифу.`
}

export default function RegionTariffsModal({ region, onClose }) {
  const [tariffs, setTariffs] = useState(FALLBACK_TARIFFS)

  useEffect(() => {
    fetchTariffs()
      .then((data) => {
        if (data.length > 0) setTariffs(mapTariffs(data))
      })
      .catch(() => {})
  }, [])

  const title = REGION_TITLES[region] || ''
  const extraText = useMemo(() => buildExtraText(tariffs), [tariffs])

  return (
    <div className='new-regions-overlay' onClick={onClose}>
      <div className='new-regions-modal' onClick={(e) => e.stopPropagation()}>
        <button type='button' className='new-regions-close' onClick={onClose} aria-label='Закрыть'>
          ×
        </button>

        <h2 className='new-regions-title'>{title}</h2>

        <ul className='new-regions-list'>
          {tariffs.map((tariff) => (
            <li key={tariff.name} className='new-regions-item'>
              {tariff.name} — {tariff.price_per_km} руб/км
            </li>
          ))}
        </ul>

        <p className='new-regions-checkpoints'>
          {extraText}
        </p>

        <Link to='/calculator' className='new-regions-submit' onClick={onClose}>
          Заказать
        </Link>
      </div>
    </div>
  )
}
