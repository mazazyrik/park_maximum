import { useState, useEffect } from 'react'
import { fetchRoutes } from '../../api'
import { CITY_IMAGES } from '../../constants/images'

const PRICE_ROWS = [
  { left: 'standard', right: 'minivan' },
  { left: 'comfort', right: 'minivan8' },
  { left: 'comfort_plus', right: null },
]

function formatPrice(price) {
  return Number(price).toLocaleString('ru-RU')
}

function RouteCard({ route }) {
  const title = `${route.from_city} — ${route.to_city}`
  const image = CITY_IMAGES[route.to_city]

  const priceMap = {}
  route.prices.forEach((p) => { priceMap[p.tariff_slug] = p })

  return (
    <div className='route-card'>
      <h3 className='route-card-title'>{title}</h3>

      <div className='route-card-prices'>
        {PRICE_ROWS.map((row, i) => {
          const left = priceMap[row.left]
          const right = row.right ? priceMap[row.right] : null
          return (
            <div key={i} className='route-card-price-row'>
              <span className='route-card-price'>
                {left ? `${left.tariff_name} от ${formatPrice(left.price)} руб` : ''}
              </span>
              <span className='route-card-price'>
                {right ? `${right.tariff_name} от ${formatPrice(right.price)} руб` : ''}
              </span>
            </div>
          )
        })}
      </div>

      <div className='route-card-image-wrap'>
        {image && (
          <img
            src={image}
            alt={title}
            className='route-card-image'
            loading='lazy'
            decoding='async'
          />
        )}
      </div>
    </div>
  )
}

export default function Routes() {
  const [routes, setRoutes] = useState([])
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    fetchRoutes()
      .then((data) => {
        setRoutes(data)
        setLoadError(false)
      })
      .catch(() => setLoadError(true))
  }, [])

  return (
    <section className='section-block' id='routes'>
      <div className='container-inner'>
        <h2 className='section-title'>Популярные маршруты</h2>

        {loadError && (
          <p className='routes-empty'>
            Не удалось загрузить маршруты. Запустите бэкенд или обновите страницу.
          </p>
        )}

        {!loadError && routes.length === 0 && (
          <p className='routes-empty'>Маршруты загружаются...</p>
        )}

        <div className='routes-grid'>
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>

        <div className='routes-cta'>
          <a href='/calculator' className='btn-secondary'>
            Расчитать стоимость
          </a>
        </div>
      </div>
    </section>
  )
}
