import { useState, useEffect } from 'react'
import { fetchRoutes } from '../../api'

import cityLugansk from '../../assets/images/city-lugansk.png'
import cityDonetsk from '../../assets/images/city-donetsk.png'
import cityRostov from '../../assets/images/city-rostov.png'
import cityKrasnodar from '../../assets/images/city-krasnodar.png'
import citySpb from '../../assets/images/city-spb.png'
import cityCrimea from '../../assets/images/city-crimea.png'

const CITY_IMAGES = {
  'Луганск': cityLugansk,
  'Донецк': cityDonetsk,
  'Ростов': cityRostov,
  'Краснодарский край': cityKrasnodar,
  'Санкт-Петербург': citySpb,
  'Крым': cityCrimea,
}

const PRICE_ROWS = [
  { left: 'standard', right: 'business' },
  { left: 'comfort', right: 'minivan' },
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3
        style={{
          fontSize: '26px',
          fontWeight: '800',
          color: '#282828',
          textAlign: 'center',
        }}
      >
        {title}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
        {PRICE_ROWS.map((row, i) => {
          const left = priceMap[row.left]
          const right = row.right ? priceMap[row.right] : null
          return (
            <div key={i} style={{ display: 'contents' }}>
              <span style={{ fontSize: '18px', color: '#282828', fontWeight: '400' }}>
                {left
                  ? `${left.tariff_name} от ${formatPrice(left.price)} руб`
                  : ''}
              </span>
              <span style={{ fontSize: '18px', color: '#282828', fontWeight: '400' }}>
                {right
                  ? `${right.tariff_name} от ${formatPrice(right.price)} руб`
                  : ''}
              </span>
            </div>
          )
        })}
      </div>

      <div
        style={{
          borderRadius: '20px',
          overflow: 'hidden',
          height: '405px',
        }}
      >
        {image && (
          <img
            src={image}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>
    </div>
  )
}

export default function Routes() {
  const [routes, setRoutes] = useState([])

  useEffect(() => {
    fetchRoutes()
      .then((data) => setRoutes(data))
      .catch(() => {})
  }, [])

  return (
    <section
      style={{ backgroundColor: '#fff', padding: '60px 50px' }}
      id='routes'
    >
      <div style={{ maxWidth: '1340px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: '40px',
            fontWeight: '800',
            color: '#282828',
            marginBottom: '48px',
          }}
        >
          Популярные маршруты
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px 92px',
          }}
        >
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px' }}>
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
    </section>
  )
}
