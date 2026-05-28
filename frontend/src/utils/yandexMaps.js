const YANDEX_MAPS_KEY = 'd616795a-d7a1-4463-955d-ec3fa7e42ba9'

let loadPromise = null

export function loadYandexMaps() {
  if (window.ymaps) {
    return new Promise((resolve) => {
      window.ymaps.ready(resolve)
    })
  }

  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_MAPS_KEY}&lang=ru_RU`
    script.async = true
    script.onload = () => {
      window.ymaps.ready(resolve)
    }
    script.onerror = reject
    document.head.appendChild(script)
  })

  return loadPromise
}
