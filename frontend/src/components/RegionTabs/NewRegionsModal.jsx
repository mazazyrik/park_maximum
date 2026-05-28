import { useState, useEffect } from 'react'
import OrderModal from '../../pages/Calculator/OrderModal'
import { fetchNewTerritories } from '../../api'

const CHECKPOINTS =
  'Чертково, Богучар, Бугаевка, Авило-Успенка, Весело-Вознесенская, Волошино, Ровеньки, Валуйки и тд.'

function formatPrice(price) {
  return Number(price).toLocaleString('ru-RU')
}

export default function NewRegionsModal({ onClose }) {
  const [showOrder, setShowOrder] = useState(false)
  const [routes, setRoutes] = useState([])
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    fetchNewTerritories()
      .then((data) => {
        setRoutes(data)
        setLoadError(false)
      })
      .catch(() => setLoadError(true))
  }, [])

  if (showOrder) {
    return (
      <OrderModal
        onClose={() => {
          setShowOrder(false)
          onClose()
        }}
        orderData={{
          from_address: 'Москва',
          to_address: 'Новые регионы, детали уточнить у клиента',
          tariff: null,
          trip_datetime: null,
          need_docs: false,
          distance_km: 0,
          estimated_cost: '0',
        }}
        shortRequest
      />
    )
  }

  return (
    <div className='new-regions-overlay' onClick={onClose}>
      <div className='new-regions-modal' onClick={(e) => e.stopPropagation()}>
        <button type='button' className='new-regions-close' onClick={onClose} aria-label='Закрыть'>
          ×
        </button>

        <h2 className='new-regions-title'>Новые регионы</h2>

        {loadError && (
          <p className='new-regions-note'>Не удалось загрузить маршруты.</p>
        )}

        {!loadError && routes.length === 0 && (
          <p className='new-regions-note'>Маршруты загружаются...</p>
        )}

        <ul className='new-regions-list'>
          {routes.map((route) => (
            <li key={route.id} className='new-regions-item'>
              {route.from_city} — {route.to_city} от {formatPrice(route.from_price)} р.
            </li>
          ))}
        </ul>

        <p className='new-regions-checkpoints'>
          Забираем и доставляем к КПП {CHECKPOINTS}
        </p>

        <p className='new-regions-note'>
          Стоимость и детали маршрута уточняет оператор при звонке.
        </p>

        <button
          type='button'
          className='new-regions-submit'
          onClick={() => setShowOrder(true)}
        >
          Оставить заявку
        </button>
      </div>
    </div>
  )
}
