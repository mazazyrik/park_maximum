import { useState, useEffect, useRef, useMemo } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import OrderModal from './OrderModal'
import DistanceLimitModal from './DistanceLimitModal'
import { fetchTariffs, fetchPricingConfig } from '../../api'
import { isNewTerritoryRoute, mapTariffsForCalculator } from '../../utils/pricing'
import { loadYandexMaps } from '../../utils/yandexMaps'

const GEOCODER_KEY = 'ae36e2e8-3202-4ead-8128-cca559d477a5'
const DEFAULT_MINIMUM_DISTANCE_KM = 200

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

function SuggestInput({
  label,
  value,
  onChange,
  onSelect,
  placeholder,
  suggestions,
  showSugg,
  onFocus,
  onBlur,
  inputRef,
}) {
  return (
    <div>
      <label className='calc-label'>{label}</label>
      <div className='calc-input-wrap'>
        <input
          ref={inputRef}
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
    minimum_distance_km: DEFAULT_MINIMUM_DISTANCE_KM,
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
  const [routeError, setRouteError] = useState(null)
  const [mapsReady, setMapsReady] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDistanceModal, setShowDistanceModal] = useState(false)
  const [fromSugg, setFromSugg] = useState([])
  const [toSugg, setToSugg] = useState([])
  const [showFromSugg, setShowFromSugg] = useState(false)
  const [showToSugg, setShowToSugg] = useState(false)

  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const mapInitDone = useRef(false)
  const suggestTimer = useRef(null)
  const routeTimer = useRef(null)
  const routeRequestId = useRef(0)
  const toInputRef = useRef(null)
  const lastWarnedRouteRef = useRef(null)

  const minimumDistance = Number(
    pricingConfig.minimum_distance_km || DEFAULT_MINIMUM_DISTANCE_KM,
  )

  const isNewTerritory = isNewTerritoryRoute(
    from,
    to,
    pricingConfig.new_territory_cities,
  )

  const tariffs = useMemo(() => {
    if (rawTariffs.length > 0) {
      return mapTariffsForCalculator(rawTariffs)
    }
    return FALLBACK_TARIFFS
  }, [rawTariffs])

  useEffect(() => {
    Promise.all([fetchTariffs(), fetchPricingConfig()])
      .then(([tariffData, config]) => {
        if (tariffData.length > 0) setRawTariffs(tariffData)
        if (config) setPricingConfig(config)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!isNewTerritory) return
    setTariffId('')
    setDistance(null)
    setCost(null)
    setRouteError(null)
    setShowDistanceModal(false)
    setNeedDocs(false)
    setDatetime('')
    if (mapInstance.current) {
      mapInstance.current.geoObjects.removeAll()
    }
  }, [isNewTerritory])

  useEffect(() => {
    if (isNewTerritory) return undefined
    loadYandexMaps()
      .then(() => setMapsReady(true))
      .catch(() => {})
    return undefined
  }, [isNewTerritory])

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
    resetCalculatedRoute()
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
    resetCalculatedRoute()
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

  function resetCalculatedRoute() {
    setDistance(null)
    setCost(null)
    setRouteError(null)
    setIsRouting(false)
    setShowDistanceModal(false)
    routeRequestId.current += 1
    lastWarnedRouteRef.current = null
    if (mapInstance.current) {
      mapInstance.current.geoObjects.removeAll()
    }
  }

  useEffect(() => {
    if (isNewTerritory) return undefined
    clearTimeout(routeTimer.current)
    if (!fromCoords || !toCoords) return undefined

    const requestId = routeRequestId.current + 1
    routeRequestId.current = requestId
    routeTimer.current = setTimeout(async () => {
      setIsRouting(true)
      setRouteError(null)

      const osrmKm = await getOsrmDistance(fromCoords, toCoords)
      if (routeRequestId.current !== requestId) return
      let yandexKm = null
      let yandexRoute = null

      if (mapsReady && window.ymaps && mapInstance.current) {
        try {
          yandexRoute = await window.ymaps.route(
            [fromCoords, toCoords],
            { routingMode: 'auto' },
          )
          yandexKm = Math.round(yandexRoute.getLength() / 1000)
          mapInstance.current.geoObjects.removeAll()
          mapInstance.current.geoObjects.add(yandexRoute.getPaths())
          mapInstance.current.setBounds(
            yandexRoute.getBounds(),
            { checkZoomRange: true },
          )
        } catch {
          yandexRoute = null
        }
      }

      if (routeRequestId.current !== requestId) return
      const km = osrmKm !== null ? osrmKm : yandexKm
      if (km === null) {
        setDistance(null)
        setCost(null)
        setRouteError('Не удалось рассчитать автомобильный маршрут. Попробуйте ещё раз.')
        setIsRouting(false)
        return
      }

      setDistance(km)
      const routeKey = `${fromCoords.join(',')}|${toCoords.join(',')}`
      if (km < minimumDistance && lastWarnedRouteRef.current !== routeKey) {
        lastWarnedRouteRef.current = routeKey
        setShowDistanceModal(true)
      }
      setIsRouting(false)
    }, 300)

    return () => {
      clearTimeout(routeTimer.current)
      if (routeRequestId.current === requestId) {
        routeRequestId.current += 1
      }
    }
  }, [fromCoords, toCoords, mapsReady, isNewTerritory, minimumDistance])

  const isBelowMinimum =
    !isNewTerritory
    && distance !== null
    && distance < minimumDistance

  useEffect(() => {
    if (isNewTerritory) {
      setCost(null)
      return
    }
    if (distance === null || isBelowMinimum || routeError || !tariffId) {
      setCost(null)
      return
    }
    const t = tariffs.find((x) => String(x.id) === tariffId)
    if (!t) return
    let price = distance * t.price
    if (needDocs) price = Math.round(price * 1.1)
    setCost(Math.round(price))
  }, [
    distance,
    tariffId,
    needDocs,
    tariffs,
    isNewTerritory,
    isBelowMinimum,
    routeError,
  ])

  const distanceText = isNewTerritory
    ? '—'
    : isRouting
    ? 'вычисляется...'
    : routeError
    ? 'не удалось рассчитать'
    : distance !== null
    ? `${distance} км`
    : '—'

  const costText = isNewTerritory
    ? '—'
    : isBelowMinimum
    ? 'расчёт недоступен'
    : routeError
    ? 'расчёт недоступен'
    : cost !== null
    ? `${cost.toLocaleString('ru-RU')} руб`
    : '—'

  const selectedTariff = tariffs.find((t) => String(t.id) === tariffId)
  const canSubmit = isNewTerritory
    ? true
    : (
        distance !== null
        && distance >= minimumDistance
        && Boolean(tariffId)
        && !isRouting
        && !routeError
      )

  function closeDistanceModal() {
    setShowDistanceModal(false)
    window.requestAnimationFrame(() => toInputRef.current?.focus())
  }

  return (
    <>
      <Header />
      <main className='site-main'>
        <section className='calc-section'>
          <div className='container-inner'>
            <h1 className='calc-title'>Калькулятор</h1>
            <p className='calc-lead'>
              Осуществляем поездки протяжённостью от {minimumDistance} км.
            </p>

            {isNewTerritory && (
              <p className='calc-territory-note'>
                Маршрут затрагивает новые территории — расчёт недоступен. Оператор перезвонит и уточнит детали.
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
                inputRef={toInputRef}
              />
            </div>

            {!isNewTerritory && (
              <>
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
              </>
            )}

            <div className='calc-summary-wrap'>
              <div className='calc-summary'>
                <p className='calc-summary-line'>
                  Расстояние (прим.): {distanceText}
                </p>
                <p className='calc-summary-line'>
                  Стоимость (прим.): {costText}
                </p>
                {isBelowMinimum && (
                  <p className='calc-summary-alert' role='status'>
                    Расчёт недоступен: минимальная дистанция — {minimumDistance} км.
                  </p>
                )}
                {routeError && (
                  <p className='calc-summary-alert' role='status'>
                    {routeError}
                  </p>
                )}
                {!isNewTerritory && (
                  <>
                    <p className='calc-summary-note'>
                      *расчёт действителен только по территории РФ.
                    </p>
                    <p className='calc-summary-note'>
                      Расстояние и стоимость являются приблизительными. Итоговая сумма может
                      измениться из-за перекрытия или закрытия дорог, дорожных ситуаций, изменения
                      маршрута по запросу клиента, а также иных обстоятельств в пути.
                      Точная стоимость согласовывается с оператором.
                    </p>
                  </>
                )}
              </div>
            </div>

            {!isNewTerritory && (
              <div className='calc-map-wrap'>
                {mapsReady ? (
                  <div ref={mapRef} className='calc-map' />
                ) : (
                  <div className='calc-map-placeholder'>
                    <p>Загрузка карты...</p>
                  </div>
                )}
              </div>
            )}

            <div className='calc-submit-wrap'>
              <button
                type='button'
                onClick={() => {
                  if (canSubmit) setShowModal(true)
                }}
                className='calc-submit'
                disabled={!canSubmit}
              >
                {isNewTerritory ? 'Оставить заявку' : 'Заказать'}
              </button>
              {!isNewTerritory && !canSubmit && (
                <p className='calc-submit-note'>
                  Укажите маршрут от {minimumDistance} км и выберите тариф.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      {showModal && (
        <OrderModal
          onClose={() => setShowModal(false)}
          orderData={
            isNewTerritory
              ? {
                  from_address: from || 'Москва',
                  to_address: to || 'Новые регионы, детали уточнить у клиента',
                  tariff: null,
                  trip_datetime: null,
                  need_docs: false,
                  distance_km: 0,
                  estimated_cost: '0',
                }
              : {
                  from_address: from,
                  to_address: to,
                  tariff: selectedTariff?.id || null,
                  trip_datetime: datetime || null,
                  need_docs: needDocs,
                  distance_km: distance,
                  estimated_cost: cost ? String(cost) : null,
                }
          }
          shortRequest={isNewTerritory}
        />
      )}
      {showDistanceModal && (
        <DistanceLimitModal
          minimumDistance={minimumDistance}
          onClose={closeDistanceModal}
        />
      )}
    </>
  )
}
