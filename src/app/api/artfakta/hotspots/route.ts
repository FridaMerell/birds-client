const SOS_BASE = 'https://api.artdatabanken.se/species-observation-system/v1'
// Each zone gets two time-window queries of 500 records each (= 1000 total).
// Splitting into recent + historical prevents the "most recent 1000" from being
// entirely consumed by high-traffic urban localities that are active every week.
const TAKE_PER_WINDOW  = 500
const MIN_RECORDS_PER_SITE = 2   // require at least 2 records so single typos are filtered
const CANDIDATES_PER_ZONE = 20   // return top N localities per zone for the pool

const TAXON_GROUP_IDS: Record<string, number> = {
  bird: 4000104,
  insect: 4000072,
  plant: 5000045,
}

interface SosObservation {
  location: {
    locationId?:                    string   // canonical Artportalen site LSID
    decimalLatitude?:               number
    decimalLongitude?:              number
    locality?:                      string
    coordinateUncertaintyInMeters?: number   // registered site radius in metres
  }
  taxon?:  { id?: number }
  event?:  { startDate?: string }
}

interface Bbox {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

// Query one zone bbox and return its top localities ranked by ecological quality.
// Two time windows are queried in parallel so the fixed record budget is spread
// across recent activity AND historical baselines — preventing high-traffic urban
// locations from consuming the entire sample with this week's observations.
async function fetchWindow(
  bbox: Bbox,
  taxonFilter: string,
  subscriptionKey: string,
  startDate: string,
  endDate: string,
): Promise<SosObservation[]> {
  const filter: Record<string, unknown> = {
    // Request only the fields we actually use — much faster than fieldSet:'Extended'
    output: {
      fields: [
        'location.locationId',
        'location.locality',
        'location.decimalLatitude',
        'location.decimalLongitude',
        'location.coordinateUncertaintyInMeters',
        'taxon.id',
        'event.startDate',
      ],
    },
    geographics: {
      boundingBox: {
        topLeft:     { latitude: bbox.maxLat, longitude: bbox.minLng },
        bottomRight: { latitude: bbox.minLat, longitude: bbox.maxLng },
      },
    },
    date: { startDate, endDate, dateFilterType: 'BetweenStartDateAndEndDate' },
  }
  if (taxonFilter !== 'all' && TAXON_GROUP_IDS[taxonFilter]) {
    filter.taxon = { taxonListIds: [TAXON_GROUP_IDS[taxonFilter]], includeUnderlyingTaxa: true }
  }
  const res = await fetch(
    `${SOS_BASE}/Observations/Search?skip=0&take=${TAKE_PER_WINDOW}&sortBy=event.startDate&sortOrder=desc`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Ocp-Apim-Subscription-Key': subscriptionKey },
      body: JSON.stringify(filter),
    },
  )
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText)
    throw new Error(`SOS API ${res.status}: ${msg}`)
  }
  const data = await res.json()
  return data.records ?? []
}

async function queryZone(bbox: Bbox, taxonFilter: string, subscriptionKey: string) {
  const now    = new Date()
  const nowStr = now.toISOString().split('T')[0]
  const ago1y  = new Date(Date.now() - 1   * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0]
  const ago5y  = new Date(Date.now() - 5   * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0]

  // Window A: last 12 months — what's active right now
  // Window B: months 13-60  — historical baseline, catches seasonal/migratory sites
  const [recentRecs, historicalRecs] = await Promise.all([
    fetchWindow(bbox, taxonFilter, subscriptionKey, ago1y, nowStr),
    fetchWindow(bbox, taxonFilter, subscriptionKey, ago5y, ago1y),
  ])
  const records = [...recentRecs, ...historicalRecs]

  // visitDates: unique calendar days observers visited the locality — proxy for effort.
  // taxaPerVisit = taxonIds.size / visitDates.size is the ecological quality signal:
  // it rewards a seasonal nature reserve (20 visits × 15 new species each) over a
  // city park (300 visits × mostly the same 3 species every day).
  type Site = {
    spots:        Map<string, { lat: number; lng: number; count: number }>
    count:        number
    taxonIds:     Set<number>
    visitDates:   Set<string>   // unique YYYY-MM-DD strings
    name:         string        // official registered site name
    uncertaintyM: number        // max coordinateUncertaintyInMeters = registered site radius
  }
  const sites = new Map<string, Site>()

  for (const obs of records) {
    const lat      = obs.location?.decimalLatitude
    const lng      = obs.location?.decimalLongitude
    const taxonId  = obs.taxon?.id
    if (lat == null || lng == null) continue

    // Group by the canonical Artportalen site ID (locationId) when present.
    // This gives us actual registered sites, not text-matched locality strings
    // that split the same place across multiple groups when observers use
    // slightly different names (e.g. "Kvismaren" vs "Kvismaren naturreservat").
    const locationId = obs.location?.locationId?.trim()
    const locality   = obs.location?.locality?.trim()
    const key = locationId ?? locality
    if (!key) continue

    let s = sites.get(key)
    if (!s) {
      s = { spots: new Map(), count: 0, taxonIds: new Set(), visitDates: new Set(), name: locality ?? key, uncertaintyM: 0 }
      sites.set(key, s)
    }
    // Always prefer the registered locality name when we have it
    if (locality && !s.name.includes('lsid')) s.name = locality

    const spotKey = `${Math.round(lat * 1000)},${Math.round(lng * 1000)}`
    const spot = s.spots.get(spotKey)
    if (spot) { spot.count++ } else { s.spots.set(spotKey, { lat, lng, count: 1 }) }
    s.count++
    if (taxonId != null) s.taxonIds.add(taxonId)
    const date = obs.event?.startDate?.slice(0, 10)
    if (date) s.visitDates.add(date)
    const uncertainty = obs.location?.coordinateUncertaintyInMeters ?? 0
    if (uncertainty > s.uncertaintyM) s.uncertaintyM = uncertainty
  }

  return Array.from(sites.entries())
    .filter(([, s]) => s.count >= MIN_RECORDS_PER_SITE)
    // Primary sort: average unique taxa per visit-day (ecological richness per effort).
    // This removes the observer-density bias that makes city parks beat nature reserves.
    // Tiebreaker: raw taxon count so high-traffic reserves still rank above thin sites.
    .sort(([, a], [, b]) => {
      const aRate = a.taxonIds.size / Math.max(a.visitDates.size, 1)
      const bRate = b.taxonIds.size / Math.max(b.visitDates.size, 1)
      return bRate - aRate || b.taxonIds.size - a.taxonIds.size
    })
    .slice(0, CANDIDATES_PER_ZONE)
    .map(([key, s]) => {
      const best = Array.from(s.spots.values()).sort((a, b) => b.count - a.count)[0]
      // coordinateUncertaintyInMeters in Artportalen is the registered site's spatial
      // extent radius — wetlands/reserves typically have hundreds to thousands of
      // metres; backyards and single benches are <50 m.
      // Cap at 3 km so very large sites don't completely dominate the score.
      const spreadKm = Math.min(s.uncertaintyM / 1000, 3)
      return { id: key, name: s.name, lat: best.lat, lng: best.lng, taxonIds: Array.from(s.taxonIds), observationCount: s.count, spreadKm }
    })
}

export const POST = async (request: Request) => {
  const subscriptionKey = process.env.ARTDATA_PRIMARY
  if (!subscriptionKey) {
    return new Response(JSON.stringify({ error: 'SOS subscription key not configured' }), { status: 500 })
  }

  let zones: Bbox[]
  let taxonFilter: string

  try {
    const body = await request.json()
    zones       = body.zones
    taxonFilter = body.taxonFilter ?? 'all'
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 })
  }

  if (!zones?.length) {
    return new Response(JSON.stringify({ error: 'zones array is required' }), { status: 400 })
  }

  try {
    // Query each zone in parallel — each gets its own 1000-record budget focused
    // on its short corridor, not diluted across the whole route.
    const perZone = await Promise.all(zones.map((bbox) => queryZone(bbox, taxonFilter, subscriptionKey)))

    // Zones overlap (ROUTE_BUFFER_DEG padding), so the same locality can appear in
    // multiple zone results with split counts/taxa. Merge them here: union the taxon
    // ID sets and sum the observation counts so the final numbers are as complete as
    // possible from the combined samples.
    type ZoneSite = Awaited<ReturnType<typeof queryZone>>[number]
    const merged = new Map<string, { site: ZoneSite; taxonSet: Set<number> }>()
    for (const site of perZone.flat()) {
      const prev = merged.get(site.id)
      if (prev) {
        site.taxonIds.forEach(id => prev.taxonSet.add(id))
        // Use max rather than sum — both zone samples draw from the same pool of
        // actual observations, so summing would double-count overlapping records.
        prev.site = { ...prev.site, observationCount: Math.max(prev.site.observationCount, site.observationCount) }
      } else {
        merged.set(site.id, { site, taxonSet: new Set(site.taxonIds) })
      }
    }

    const hotspots = Array.from(merged.values()).map(({ site, taxonSet }) => ({
      id:               site.id,
      name:             site.name,
      lat:              site.lat,
      lng:              site.lng,
      taxonCount:       taxonSet.size,
      observationCount: site.observationCount,
    }))

    return new Response(JSON.stringify({ hotspots }), { status: 200 })
  } catch (error) {
    console.error('Error fetching SOS hotspots:', error)
    const msg = error instanceof Error ? error.message : 'Error fetching SOS hotspots'
    return new Response(JSON.stringify({ error: msg }), { status: 500 })
  }
}