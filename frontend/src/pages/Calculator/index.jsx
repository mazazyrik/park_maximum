import { useState, useEffect, useRef } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import OrderModal from './OrderModal'
import { fetchTariffs } from '../../api'

const GEOCODER_KEY = 'ae36e2e8-3202-4ead-8128-cca559d477a5'

const FALLBACK_TARIFFS = [
  { id: 2, slug: 'standard', label: 'Стандарт', price: 30 },
  { id: 3, slug: 'comfort', label: 'Комфорт', price: 40 },
  { id: 4, slug: 'comfort_plus', label: 'Комфорт +', price: 55 },
  { id: 5, slug: 'business', label: 'Бизнес', price: 65 },
  { id: 6, slug: 'minivan', label: 'Минивен', price: 60 },
  { id: 7, slug: 'minivan8', label: 'Минивен 8+', price: 80 },
]

async function geocodeYandex(query) {
  const url =
    `https://geocode-maps.yandex.ru/1.x/?apikey=${GEOCODER_KEY}` +
    `&format=json&geocode=${encodeURIComponent(query)}&results=6&lang=ru_RU`
  const res = await fetch(url)
  const data = await res.json()
  if (data.statusCode) return null
  const members = data.response?.GeoObjectCollection?.featureMember || []
  return members.map((m) => {
    const text = m.GeoObject.metaDataProperty.GeocoderMetaData.text
    const [lon, lat] = m.GeoObject.Point.pos.split(' ').map(Number)
    return { displayName: text, value: text, coords: [lat, lon] }
  })
}

async function geocodeNominatim(query) {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '7')
  url.searchParams.set('accept-language', 'ru')
  const res = await fetch(url.toString(), { headers: { 'User-Agent': 'park-maximum.ru/1.0' } })
  const data = await res.json()
  return data.map((item) => ({
    displayName: item.display_name,
    value: item.display_name,
    coords: [parseFloat(item.lat), parseFloat(item.lon)],
  }))
}

async function geocodeSearch(query) {
  try {
    const yandex = await geocodeYandex(query)
    if (yandex) return yandex
    return await geocodeNominatim(query)
  } catch {
    try { return await geocodeNominatim(query) } catch { return [] }
  }
}

async function getOsrmDistance(fromCoords, toCoords) {
  try {
    const [fromLat, fromLon] = fromCoords
    const [toLat, toLon] = toCoords
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${fromLon},${fromLat};${toLon},${toLat}?overview=false`
    const res = await fetch(url)
    const data = await res.json()
    if (data.code === 'Ok' && data.routes?.length > 0) {
      return Math.round(data.routes[0].distance / 1000)
    }
    return null
  } catch {
    return null
  }
}

function haversine([lat1, lon1], [lat2, lon2]) {
  const R = 6371
  const d = Math.PI / 180
  const dLat = (lat2 - lat1) * d
  const dLon = (lon2 - lon1) * d
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * d) * Math.cos(lat2 * d) * Math.sin(dLon / 2) ** 2
  return Math.round(2 * R * Math.asin(Math.sqrt(a)))
}

const labelStyle = {
  display: 'block',
  fontWeight: '800',
  fontSize: '20px',
  color: '#282828',
  marginBottom: '12px',
}

const inputStyle = {
  width: '100%',
  height: '64px',
  border: '2px solid #282828',
  borderRadius: '50px',
  padding: '0 60px 0 28px',
  fontSize: '18px',
  fontFamily: 'inherit',
  outline: 'none',
  background: '#fff',
  color: '#282828',
  boxSizing: 'border-box',
}

const arrowStyle = {
  position: 'absolute',
  right: '26px',
  top: '50%',
  transform: 'translateY(-50%)',
  fontSize: '22px',
  color: '#282828',
  pointerEvents: 'none',
  lineHeight: 1,
}

function SuggestInput({ label, value, onChange, onSelect, placeholder, suggestions, showSugg, onFocus, onBlur }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type='text'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          style={inputStyle}
        />
        <span style={arrowStyle}>›</span>
        {showSugg && suggestions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '16px',
              boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
              zIndex: 200,
              overflow: 'hidden',
            }}
          >
            {suggestions.map((s, i) => (
              <div
                key={i}
                onMouseDown={(e) => {
                  e.preventDefault()
                  onSelect(s)
                }}
                style={{
                  padding: '12px 24px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#282828',
                  borderBottom: i < suggestions.length - 1 ? '1px solid #f5f5f5' : 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8f8f8')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
              >
                {s.displayName}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Calculator() {
  const [tariffs, setTariffs] = useState(FALLBACK_TARIFFS)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [fromCoords, setFromCoords] = useState(null)
  const [toCoords, setToCoords] = useState(null)
  const [tariffId, setTariffId] = useState('')
  const [datetime, setDatetime] = useState('')
  const [needDocs, setNeedDocs] = useState(false)
  const [distance, setDistance] = useState(null)
  const [cost, setCost] = useState(null)
  const [isRouting, setIsRouting] = useState(false)
  const [mapsReady, setMapsReady] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [fromSugg, setFromSugg] = useState([])
  const [toSugg, setToSugg] = useState([])
  const [showFromSugg, setShowFromSugg] = useState(false)
  const [showToSugg, setShowToSugg] = useState(false)

  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const mapInitDone = useRef(false)
  const suggestTimer = useRef(null)
  const routeTimer = useRef(null)

  useEffect(() => {
    fetchTariffs()
      .then((data) => {
        if (data.length > 0) {
          setTariffs(data.map((t) => ({
            id: t.id,
            slug: t.slug,
            label: t.name,
            price: parseFloat(t.price_per_km),
          })))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    let attempts = 0
    const check = () => {
      if (window.ymaps) {
        window.ymaps.ready(() => setMapsReady(true))
      } else if (attempts < 20) {
        attempts++
        setTimeout(check, 400)
      }
    }
    check()
  }, [])

  useEffect(() => {
    if (!mapsReady || !mapRef.current || mapInitDone.current) return
    mapInitDone.current = true
    mapInstance.current = new window.ymaps.Map(mapRef.current, {
      center: [55.7558, 37.6173],
      zoom: 9,
      controls: ['zoomControl'],
    })
  }, [mapsReady])

  function handleFromChange(val) {
    setFrom(val)
    setFromCoords(null)
    setShowFromSugg(true)
    clearTimeout(suggestTimer.current)
    if (!val.trim()) { setFromSugg([]); return }
    suggestTimer.current = setTimeout(async () => {
      const items = await geocodeSearch(val)
      setFromSugg(items)
    }, 300)
  }

  function handleToChange(val) {
    setTo(val)
    setToCoords(null)
    setShowToSugg(true)
    clearTimeout(suggestTimer.current)
    if (!val.trim()) { setToSugg([]); return }
    suggestTimer.current = setTimeout(async () => {
      const items = await geocodeSearch(val)
      setToSugg(items)
    }, 300)
  }

  function selectFrom(item) {
    setFrom(item.value)
    setFromCoords(item.coords)
    setFromSugg([])
    setShowFromSugg(false)
  }

  function selectTo(item) {
    setTo(item.value)
    setToCoords(item.coords)
    setToSugg([])
    setShowToSugg(false)
  }

  useEffect(() => {
    clearTimeout(routeTimer.current)
    if (!fromCoords || !toCoords) return

    routeTimer.current = setTimeout(async () => {
      setIsRouting(true)

      const osrmKm = await getOsrmDistance(fromCoords, toCoords)
      const km = osrmKm !== null ? osrmKm : haversine(fromCoords, toCoords)
      setDistance(km)

      if (mapsReady && window.ymaps && mapInstance.current) {
        window.ymaps.route([fromCoords, toCoords], { routingMode: 'auto' }).then(
          (route) => {
            mapInstance.current.geoObjects.removeAll()
            mapInstance.current.geoObjects.add(route.getPaths())
            mapInstance.current.setBounds(route.getBounds(), { checkZoomRange: true })
          },
          () => {}
        )
      }

      setIsRouting(false)
    }, 300)

    return () => clearTimeout(routeTimer.current)
  }, [fromCoords, toCoords, mapsReady])

  useEffect(() => {
    if (distance === null || !tariffId) { setCost(null); return }
    const t = tariffs.find((x) => String(x.id) === tariffId)
    if (!t) return
    let price = distance * t.price
    if (needDocs) price = Math.round(price * 1.1)
    setCost(Math.round(price))
  }, [distance, tariffId, needDocs, tariffs])

  const distanceText = isRouting
    ? 'вычисляется...'
    : distance !== null
    ? `${distance} км`
    : '—'

  const costText = cost !== null ? `${cost.toLocaleString('ru-RU')} руб` : '—'

  const selectedTariff = tariffs.find((t) => String(t.id) === tariffId)

  return (
    <>
      <Header />
      <main style={{ paddingTop: '153px' }}>
        <section style={{ padding: '64px 50px 80px', background: '#fff', minHeight: 'calc(100vh - 153px)' }}>
          <div style={{ maxWidth: '1340px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '40px', fontWeight: '800', color: '#282828', marginBottom: '48px' }}>
              Калькулятор
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '40px' }}>
              <SuggestInput
                label='Откуда'
                value={from}
                onChange={handleFromChange}
                onSelect={selectFrom}
                placeholder='Введите город отправления'
                suggestions={fromSugg}
                showSugg={showFromSugg}
                onFocus={() => setShowFromSugg(fromSugg.length > 0)}
                onBlur={() => setTimeout(() => setShowFromSugg(false), 160)}
              />
              <SuggestInput
                label='Куда'
                value={to}
                onChange={handleToChange}
                onSelect={selectTo}
                placeholder='Введите адрес назначения'
                suggestions={toSugg}
                showSugg={showToSugg}
                onFocus={() => setShowToSugg(toSugg.length > 0)}
                onBlur={() => setTimeout(() => setShowToSugg(false), 160)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '40px' }}>
              <div>
                <label style={labelStyle}>Тариф</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={tariffId}
                    onChange={(e) => setTariffId(e.target.value)}
                    style={{
                      ...inputStyle,
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      cursor: 'pointer',
                      color: tariffId ? '#282828' : '#999',
                    }}
                  >
                    <option value=''>Выберите тариф</option>
                    {tariffs.map((t) => (
                      <option key={t.id} value={String(t.id)}>
                        {t.label} — {t.price} руб/км
                      </option>
                    ))}
                  </select>
                  <span style={arrowStyle}>›</span>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Дата и время</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type='datetime-local'
                    value={datetime}
                    onChange={(e) => setDatetime(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer', colorScheme: 'light' }}
                  />
                </div>
              </div>
            </div>

            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                marginBottom: '40px',
                userSelect: 'none',
              }}
            >
              <div
                onClick={() => setNeedDocs((v) => !v)}
                style={{
                  width: '48px',
                  height: '48px',
                  border: '2px solid #282828',
                  borderRadius: '8px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: needDocs ? '#282828' : '#fff',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {needDocs && (
                  <span style={{ color: '#FEDA00', fontSize: '26px', fontWeight: '800', lineHeight: 1 }}>
                    ✓
                  </span>
                )}
              </div>
              <span style={{ fontSize: '20px', fontWeight: '700', color: '#282828' }}>
                Отчетные документы (+10% к стоимости)
              </span>
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '52px' }}>
              <div
                style={{
                  width: '630px',
                  border: '2px solid #FEDA00',
                  borderRadius: '20px',
                  padding: '32px 40px',
                  background: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <p style={{ fontSize: '20px', fontWeight: '800', color: '#282828' }}>
                  Расстояние (прим.): {distanceText}
                </p>
                <p style={{ fontSize: '20px', fontWeight: '800', color: '#282828' }}>
                  Стоимость (прим.): {costText}
                </p>
                <p style={{ fontSize: '13px', color: '#888', lineHeight: '1.5', marginTop: '4px' }}>
                  Расстояние и стоимость являются приблизительными. Итоговая сумма может
                  измениться из-за перекрытия или закрытия дорог, дорожных ситуаций, изменения
                  маршрута по запросу клиента, а также иных обстоятельств в пути.
                  Точная стоимость согласовывается с оператором.
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '52px' }}>
              {mapsReady ? (
                <div
                  ref={mapRef}
                  style={{
                    width: '680px',
                    height: '400px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    margin: '0 auto',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '680px',
                    height: '400px',
                    borderRadius: '12px',
                    background: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    border: '1px solid #e8e8e8',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <p style={{ color: '#aaa', fontSize: '16px' }}>Загрузка карты...</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  width: '400px',
                  height: '85px',
                  borderRadius: '20px',
                  fontSize: '22px',
                  fontWeight: '800',
                  fontFamily: 'inherit',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: '#282828',
                  color: '#FEDA00',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Заказать
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      {showModal && (
        <OrderModal
          onClose={() => setShowModal(false)}
          orderData={{
            from_address: from,
            to_address: to,
            tariff: selectedTariff?.id || null,
            trip_datetime: datetime || null,
            need_docs: needDocs,
            distance_km: distance,
            estimated_cost: cost ? String(cost) : null,
          }}
        />
      )}
    </>
  )
}
