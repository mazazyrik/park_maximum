const MINIVAN_SLUGS = ['minivan', 'minivan8']

export function matchesNewTerritory(address, cities = []) {
  if (!address) return false
  const lower = address.toLowerCase()
  return cities.some((city) => lower.includes(city.toLowerCase()))
}

export function isNewTerritoryRoute(fromAddress, toAddress, cities = []) {
  return matchesNewTerritory(fromAddress, cities) || matchesNewTerritory(toAddress, cities)
}

export function getTariffRate(tariff, isNewTerritory, minivanSlugs = MINIVAN_SLUGS) {
  const base = parseFloat(tariff.price_per_km)
  const nt = tariff.new_territory_price_per_km != null
    ? parseFloat(tariff.new_territory_price_per_km)
    : null

  if (!isNewTerritory) return base
  if (nt != null && !Number.isNaN(nt)) return nt
  return minivanSlugs.includes(tariff.slug) ? 150 : 100
}

export function mapTariffsForCalculator(apiData, isNewTerritory, minivanSlugs = MINIVAN_SLUGS) {
  return apiData.map((t) => ({
    id: t.id,
    slug: t.slug,
    label: t.name,
    price: getTariffRate(t, isNewTerritory, minivanSlugs),
    price_per_km: parseFloat(t.price_per_km),
    new_territory_price_per_km: t.new_territory_price_per_km != null
      ? parseFloat(t.new_territory_price_per_km)
      : null,
  }))
}
