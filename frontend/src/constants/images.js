const STATIC_BASE = import.meta.env.VITE_STATIC_URL
  || 'https://cdn.jsdelivr.net/gh/mazazyrik/park_maximum@main/frontend/src/assets/images'

export function staticImage(name) {
  return `${STATIC_BASE}/${name}`
}

export const IMAGES = {
  heroCar: staticImage('hero-car.webp'),
  logoDark: staticImage('logo-dark.webp'),
  logoLight: staticImage('logo-light.webp'),
  iconMail: staticImage('icon-mail.webp'),
  iconTelegram: staticImage('icon-telegram.webp'),
  carSolaris: staticImage('car-solaris.webp'),
  kiaRio: staticImage('kia-rio.webp'),
  skodaRapid: staticImage('skoda-rapid.webp'),
  hyundaiElantra: staticImage('hyundai-elantra.webp'),
  belgeeX50: staticImage('belgee-x50.webp'),
  cheryTiggo: staticImage('chery-tiggo.webp'),
  toyotaCamry: staticImage('toyota-camry.webp'),
  kiaOptima: staticImage('kia-optima.webp'),
  belgeeX70: staticImage('belgee-x70.webp'),
  cheryArrizo8: staticImage('chery-arrizo8.webp'),
  mercedesVito: staticImage('mercedes-vito.webp'),
  mercedesSprinter: staticImage('mercedes-sprinter.webp'),
  cityLugansk: staticImage('city-lugansk.webp'),
  cityDonetsk: staticImage('city-donetsk.webp'),
  cityRostov: staticImage('city-rostov.webp'),
  cityKrasnodar: staticImage('city-krasnodar.webp'),
  citySpb: staticImage('city-spb.webp'),
  cityCrimea: staticImage('city-crimea.webp'),
}

export const CAR_IMAGES = {
  'Hyundai Solaris': IMAGES.carSolaris,
  'Kia Rio': IMAGES.kiaRio,
  'Skoda Rapid': IMAGES.skodaRapid,
  'Hyundai Elantra': IMAGES.hyundaiElantra,
  'Belgee X50': IMAGES.belgeeX50,
  'Chery Tiggo': IMAGES.cheryTiggo,
  'Toyota Camry': IMAGES.toyotaCamry,
  'Kia Optima': IMAGES.kiaOptima,
  'Belgee X70': IMAGES.belgeeX70,
  'Chery Arrizo 8': IMAGES.cheryArrizo8,
  'Mercedes Vito': IMAGES.mercedesVito,
  'Mercedes Sprinter': IMAGES.mercedesSprinter,
}

export const CITY_IMAGES = {
  'Луганск': IMAGES.cityLugansk,
  'Донецк': IMAGES.cityDonetsk,
  'Ростов': IMAGES.cityRostov,
  'Краснодарский край': IMAGES.cityKrasnodar,
  'Санкт-Петербург': IMAGES.citySpb,
  'Крым': IMAGES.cityCrimea,
}
