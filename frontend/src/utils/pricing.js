export function matchesNewTerritory(address, cities = []) {
  if (!address) return false
  const lower = address.toLowerCase()
  return cities.some((city) => lower.includes(city.toLowerCase()))
}

export function isNewTerritoryRoute(fromAddress, toAddress, cities = []) {
  return matchesNewTerritory(fromAddress, cities) || matchesNewTerritory(toAddress, cities)
}

export function mapTariffsForCalculator(apiData) {
  return apiData.map((t) => ({
    id: t.id,
    slug: t.slug,
    label: t.name,
    price: parseFloat(t.price_per_km),
    price_per_km: parseFloat(t.price_per_km),
  }))
}
