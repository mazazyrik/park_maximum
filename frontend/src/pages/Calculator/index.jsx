import { useState, useEffect, useRef, useMemo } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import OrderModal from './OrderModal'
import { fetchTariffs, fetchPricingConfig } from '../../api'
import { isNewTerritoryRoute, mapTariffsForCalculator } from '../../utils/pricing'

const GEOCODER_KEY = 'ae36e2e8-3202-4ead-8128-cca559d477a5'

const FALLBACK_TARIFFS = [
  { id: 'standard', slug: 'standard', label: 'Стандарт', price: 30 },
  { id: 'comfort', slug: 'comfort', label: 'Комфорт', price: 35 },
  { id: 'comfort_plus', slug: 'comfort_plus', label: 'Комфорт +', price: 40 },
  { id: 'minivan', slug: 'minivan', label: 'Минивен', price: 50 },
  { id: 'minivan8', slug: 'minivan8', label: 'Минивен 8+', price: 70 },
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

function SuggestInput({ label, value, onChange, onSelect, placeholder, suggestions, showSugg, onFocus, onBlur }) {
  return (
    <div>
      <label className='calc-label'>{label}</label>
      <div className='calc-input-wrap'>
        <input
          type='text'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className='calc-input'
        />
        <span className='calc-arrow'>›</span>
        {showSugg && suggestions.length > 0 && (
          <div className='calc-suggest'>
            {suggestions.map((s, i) => (
              <div
                key={i}
                className='calc-suggest-item'
                onMouseDown={(e) => {
                  e.preventDefault()
                  onSelect(s)
                }}
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
  const [rawTariffs, setRawTariffs] = useState([])
  const [pricingConfig, setPricingConfig] = useState({
    new_territory_cities: ['Луганск', 'Донецк'],
    minivan_slugs: ['minivan', 'minivan8'],
  })
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

  const isNewTerritory = isNewTerritoryRoute(
    from,
    to,
    pricingConfig.new_territory_cities,
  )

  const tariffs = useMemo(() => {
    if (rawTariffs.length > 0) {
      return mapTariffsForCalculator(
        rawTariffs,
        isNewTerritory,
        pricingConfig.minivan_slugs,
      )
    }
    if (!isNewTerritory) return FALLBACK_TARIFFS
    return FALLBACK_TARIFFS.map((t) => ({
      ...t,
      price: pricingConfig.minivan_slugs.includes(t.slug) ? 150 : 100,
    }))
  }, [rawTariffs, isNewTerritory, pricingConfig.minivan_slugs])

  useEffect(() => {
    Promise.all([fetchTariffs(), fetchPricingConfig()])
      .then(([tariffData, config]) => {
        if (tariffData.length > 0) setRawTariffs(tariffData)
        if (config) setPricingConfig(config)
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
      <main className='site-main'>
        <section className='calc-section'>
          <div className='container-inner'>
            <h1 className='calc-title'>Калькулятор</h1>

            {isNewTerritory && (
              <p className='calc-territory-note'>
                Маршрут затрагивает новые территории — применён тариф новых территорий
              </p>
            )}

            <div className='calc-grid'>
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

            <div className='calc-grid'>
              <div>
                <label className='calc-label'>Тариф</label>
                <div className='calc-input-wrap'>
                  <select
                    value={tariffId}
                    onChange={(e) => setTariffId(e.target.value)}
                    className={`calc-input calc-input--select ${tariffId ? '' : 'calc-input--placeholder'}`}
                  >
                    <option value=''>Выберите тариф</option>
                    {tariffs.map((t) => (
                      <option key={t.id} value={String(t.id)}>
                        {t.label} — {t.price} руб/км
                      </option>
                    ))}
                  </select>
                  <span className='calc-arrow'>›</span>
                </div>
              </div>

              <div>
                <label className='calc-label'>Дата и время</label>
                <div className='calc-input-wrap'>
                  <input
                    type='datetime-local'
                    value={datetime}
                    onChange={(e) => setDatetime(e.target.value)}
                    className='calc-input calc-input--datetime'
                  />
                </div>
              </div>
            </div>

            <label className='calc-checkbox-row'>
              <div
                role='checkbox'
                aria-checked={needDocs}
                tabIndex={0}
                onClick={() => setNeedDocs((v) => !v)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setNeedDocs((v) => !v)
                  }
                }}
                className={`calc-checkbox ${needDocs ? 'calc-checkbox--checked' : ''}`}
              >
                {needDocs && <span className='calc-checkbox-mark'>✓</span>}
              </div>
              <span className='calc-checkbox-text'>
                Отчетные документы (+10% к стоимости)
              </span>
            </label>

            <div className='calc-summary-wrap'>
              <div className='calc-summary'>
                <p className='calc-summary-line'>
                  Расстояние (прим.): {distanceText}
                </p>
                <p className='calc-summary-line'>
                  Стоимость (прим.): {costText}
                </p>
                <p className='calc-summary-note'>
                  Расстояние и стоимость являются приблизительными. Итоговая сумма может
                  измениться из-за перекрытия или закрытия дорог, дорожных ситуаций, изменения
                  маршрута по запросу клиента, а также иных обстоятельств в пути.
                  Точная стоимость согласовывается с оператором.
                </p>
              </div>
            </div>

            <div className='calc-map-wrap'>
              {mapsReady ? (
                <div ref={mapRef} className='calc-map' />
              ) : (
                <div className='calc-map-placeholder'>
                  <p>Загрузка карты...</p>
                </div>
              )}
            </div>

            <div className='calc-submit-wrap'>
              <button type='button' onClick={() => setShowModal(true)} className='calc-submit'>
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
