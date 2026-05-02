'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AdvancedMarker, Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps'
import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  Group,
  Paper,
  Progress,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { IconArrowDown, IconExternalLink, IconLeaf, IconMapPin, IconRefresh, IconX } from '@tabler/icons-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LatLng {
  lat: number
  lng: number
}

interface Hotspot extends LatLng {
  id: string
  taxonCount: number
  observationCount: number
  spreadKm: number   // bounding-box diagonal of all observation spots — large = rural/reserve
  score: number
  detourKm: number
  routeT?: number   // arc-length position along route (0 = origin, 1 = dest)
  placeName?: string
}

interface RouteResult {
  picks: Hotspot[]
  pool: Hotspot[]
  routePath: LatLng[]                              // actual driving path for proximity queries
  directionsResult: google.maps.DirectionsResult  // rendered on the map
  origin: LatLng & { formatted: string }
  dest: LatLng & { formatted: string }
  directKm: number
  extraKm: number
  totalTaxa: number
}

type TaxonFilter = 'all' | 'bird' | 'insect' | 'plant'

// ─── Constants ────────────────────────────────────────────────────────────────

// Small padding around the path bounding box — tighter than the old endpoint-only approach
// because the path already hugs the actual road.
const ROUTE_BUFFER_DEG = 0.12  // ~13 km

// ─── Pure geo helpers ─────────────────────────────────────────────────────────

const haversine = (a: LatLng, b: LatLng): number => {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
    Math.cos((b.lat * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

// Project point p onto the route polyline.
// Returns arc-length t ∈ [0, 1] and the perpendicular distance in km.
const projectOntoPath = (p: LatLng, path: LatLng[]): { t: number; distKm: number } => {
  if (path.length < 2) return { t: 0, distKm: haversine(p, path[0] ?? p) }

  // Precompute per-segment lengths and total arc length
  let totalLen = 0
  const segLens = path.slice(0, -1).map((a, i) => {
    const l = haversine(a, path[i + 1])
    totalLen += l
    return l
  })
  if (totalLen === 0) return { t: 0, distKm: haversine(p, path[0]) }

  // Use midpoint latitude for cosine correction (good enough for Sweden)
  const midLat = (path[0].lat + path[path.length - 1].lat) / 2
  const cosLat = Math.cos((midLat * Math.PI) / 180)

  let bestDist = Infinity
  let bestArcLen = 0
  let cumLen = 0

  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i], b = path[i + 1]
    const dx = (b.lng - a.lng) * cosLat
    const dy = b.lat - a.lat
    const len2 = dx * dx + dy * dy
    const localT = len2 > 0
      ? Math.max(0, Math.min(1, ((p.lng - a.lng) * cosLat * dx + (p.lat - a.lat) * dy) / len2))
      : 0
    const nearest = { lat: a.lat + localT * (b.lat - a.lat), lng: a.lng + localT * (b.lng - a.lng) }
    const dist = haversine(p, nearest)
    if (dist < bestDist) {
      bestDist = dist
      bestArcLen = cumLen + localT * segLens[i]
    }
    cumLen += segLens[i]
  }

  return { t: bestArcLen / totalLen, distKm: bestDist }
}

const pathLengthKm = (path: LatLng[]): number =>
  path.slice(0, -1).reduce((s, a, i) => s + haversine(a, path[i + 1]), 0)

const pathBbox = (path: LatLng[]) => ({
  minLat: Math.min(...path.map((p) => p.lat)) - ROUTE_BUFFER_DEG,
  maxLat: Math.max(...path.map((p) => p.lat)) + ROUTE_BUFFER_DEG,
  minLng: Math.min(...path.map((p) => p.lng)) - ROUTE_BUFFER_DEG,
  maxLng: Math.max(...path.map((p) => p.lng)) + ROUTE_BUFFER_DEG,
})

// Divide the route path into `count` equal zones (by path index) and return
// a bounding box for each zone. Each zone gets its own API query so the
// 1000-observation budget is focused on a short corridor rather than diluted
// across the whole route.
const zoneBboxes = (path: LatLng[], count: number) => {
  const size = Math.max(1, Math.ceil(path.length / count))
  return Array.from({ length: count }, (_, i) =>
    pathBbox(path.slice(i * size, Math.min((i + 1) * size + 1, path.length)))
  )
}

// Returns the nearest interpolated coordinate on a polyline — used to snap an
// unreachable SOS coordinate to the closest point on the known drivable route.
const nearestOnPath = (p: LatLng, path: LatLng[]): LatLng => {
  if (path.length < 2) return path[0] ?? p
  const midLat = (path[0].lat + path[path.length - 1].lat) / 2
  const cosLat = Math.cos((midLat * Math.PI) / 180)
  let bestDist = Infinity
  let best: LatLng = path[0]
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i], b = path[i + 1]
    const dx = (b.lng - a.lng) * cosLat
    const dy = b.lat - a.lat
    const len2 = dx * dx + dy * dy
    const t = len2 > 0
      ? Math.max(0, Math.min(1, ((p.lng - a.lng) * cosLat * dx + (p.lat - a.lat) * dy) / len2))
      : 0
    const nearest: LatLng = { lat: a.lat + t * (b.lat - a.lat), lng: a.lng + t * (b.lng - a.lng) }
    const dist = haversine(p, nearest)
    if (dist < bestDist) { bestDist = dist; best = nearest }
  }
  return best
}

// Extract the simplified overview polyline from a DirectionsResult
const extractPath = (result: google.maps.DirectionsResult): LatLng[] =>
  (result.routes[0]?.overview_path ?? []).map((p) => ({ lat: p.lat(), lng: p.lng() }))

// Driving distance from the Google route legs (accurate, not our approximation)
const legsKm = (result: google.maps.DirectionsResult): number =>
  Math.round(
    (result.routes[0]?.legs ?? []).reduce((s, leg) => s + (leg.distance?.value ?? 0), 0) / 1000,
  )

// ─── Ranking ──────────────────────────────────────────────────────────────────

const rankHotspots = (
  cells: Hotspot[],
  routePath: LatLng[],
  count: number,
): { picks: Hotspot[]; pool: Hotspot[] } => {
  const empty = { picks: [], pool: [] }
  if (!cells.length || routePath.length < 2) return empty

  const drivingKm = pathLengthKm(routePath)
  // Corridor: 15 % of driving distance, at least 8 km, at most 40 km
  const corridorKm = Math.max(Math.min(drivingKm * 0.15, 40), 8)

  const maxTaxa = Math.max(...cells.map((c) => c.taxonCount), 1)

  // Score every cell; discard those outside the corridor or behind origin/past dest
  const scored = cells
    .map((c) => {
      const { t, distKm } = projectOntoPath(c, routePath)
      if (distKm > corridorKm || t < 0 || t > 1) return null
      const richness  = c.taxonCount / maxTaxa
      // spreadScore: how large the locality's observation footprint is.
      // Caps at 3 km — a proper nature reserve wins decisively over a city-park corner.
      // A site with <0.3 km spread (backyard / single park bench) scores near zero.
      const spreadScore = Math.min(c.spreadKm / 3, 1)
      // Weights: 35% taxon richness, 35% geographic spread, 30% proximity to route.
      const score = 0.35 * richness + 0.35 * spreadScore + 0.30 * (1 - distKm / corridorKm)
      return { ...c, score, detourKm: Math.round(distKm * 2), routeT: t }
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)

  if (!scored.length) return empty

  // Distribute targets at 1/(N+1), …, N/(N+1) so stops stay away from both endpoints.
  // Enforce a minimum arc-length gap between any two picks so dense clusters of
  // observations don't result in multiple stops in the same spot.
  type Scored = typeof scored[number]
  const picks: Scored[] = []
  const used = new Set<string>()
  // Minimum gap: 70 % of the ideal even spacing. E.g. for 3 stops the ideal gap
  // is 0.25, so no two picks may be closer than routeT 0.175.
  const minSep = 0.7 / (count + 1)

  const isTooClose = (c: Scored) =>
    picks.some((p) => Math.abs(p.routeT - c.routeT) < minSep)

  for (let i = 0; i < count; i++) {
    const target = (i + 1) / (count + 1)
    const halfWidth = 0.5 / (count + 1)

    // Unified soft-bucket: candidates inside the bucket get no position penalty.
    // Outside the bucket the score is reduced proportionally to the deviation — this
    // means a great nature reserve just past the bucket edge still beats a mediocre
    // site dead-centre, while stops still stay roughly in their intended slots.
    const best = scored
      .filter((c) => !used.has(c.id) && !isTooClose(c))
      .sort((a, b) => {
        const penA = Math.max(0, Math.abs(a.routeT - target) - halfWidth) / halfWidth
        const penB = Math.max(0, Math.abs(b.routeT - target) - halfWidth) / halfWidth
        return (b.score - penB * 0.4) - (a.score - penA * 0.4)
      })[0]

    if (best) {
      used.add(best.id)
      picks.push(best)
    }
  }

  const pool = scored
    .filter((c) => !used.has(c.id))
    .sort((a, b) => b.score - a.score)

  return {
    picks: picks.sort((a, b) => a.routeT - b.routeT),
    pool,
  }
}

// ─── DirectionsLayer ─────────────────────────────────────────────────────────
// Renders a pre-computed DirectionsResult. No service calls here — the parent
// handles routing so it can extract the path and query hotspots against it.

const DirectionsLayer = ({ directionsResult }: { directionsResult: google.maps.DirectionsResult }) => {
  const map = useMap()
  const routesLib = useMapsLibrary('routes')

  useEffect(() => {
    if (!map || !routesLib) return
    const renderer = new routesLib.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: { strokeColor: '#2f9e44', strokeWeight: 4, strokeOpacity: 0.85 },
    })
    renderer.setDirections(directionsResult)
    return () => renderer.setMap(null)
  }, [map, routesLib, directionsResult])

  return null
}

// ─── Main component ───────────────────────────────────────────────────────────

const RoutePlanner = () => {
  const geocodingLib = useMapsLibrary('geocoding')
  const placesLib = useMapsLibrary('places')
  const routesLib = useMapsLibrary('routes')  // used for DirectionsService outside <Map>

  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null)
  useEffect(() => {
    if (geocodingLib) setGeocoder(new geocodingLib.Geocoder())
  }, [geocodingLib])

  const [originText, setOriginText] = useState('')
  const [destText, setDestText] = useState('')
  const [stopCount, setStopCount] = useState(3)
  const [taxonFilter, setTaxonFilter] = useState<TaxonFilter>('all')
  const [result, setResult] = useState<RouteResult | null>(null)
  const [loadingMsg, setLoadingMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [replacingStop, setReplacingStop] = useState<number | null>(null)
  const map = useMap('route-planner-preview')

  const originRef = useRef<HTMLInputElement>(null)
  const destRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!placesLib) return
    const instances: google.maps.places.Autocomplete[] = []
    const attach = (el: HTMLInputElement | null, setter: (v: string) => void) => {
      if (!el) return
      const ac = new placesLib.Autocomplete(el, {
        types: ['geocode'],
        componentRestrictions: { country: 'se' },
      })
      ac.addListener('place_changed', () => {
        const place = ac.getPlace()
        if (place.formatted_address) setter(place.formatted_address)
      })
      instances.push(ac)
    }
    attach(originRef.current, setOriginText)
    attach(destRef.current, setDestText)
    return () => { instances.forEach((ac) => google.maps.event.clearInstanceListeners(ac)) }
  }, [placesLib])

  const geocodeAddress = useCallback(
    (address: string): Promise<LatLng & { formatted: string }> =>
      new Promise((resolve, reject) => {
        if (!geocoder) return reject(new Error('Geocoder not ready'))
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            const loc = results[0].geometry.location
            resolve({ lat: loc.lat(), lng: loc.lng(), formatted: results[0].formatted_address })
          } else {
            reject(new Error(`Could not find "${address}" (${status})`))
          }
        })
      }),
    [geocoder],
  )

  const reverseGeocode = useCallback(
    (point: LatLng): Promise<string> =>
      new Promise((resolve) => {
        if (!geocoder) return resolve('')
        geocoder.geocode({ location: point }, (results, status) => {
          if (status !== 'OK' || !results?.length) return resolve('')
          for (const r of results) {
            for (const comp of r.address_components) {
              if (comp.types.some((t) =>
                ['locality', 'sublocality', 'natural_feature', 'park', 'establishment'].includes(t)
              )) return resolve(comp.long_name)
            }
          }
          resolve(results[0].formatted_address.split(',')[0])
        })
      }),
    [geocoder],
  )

  // Thin wrapper around DirectionsService.
  // If routing fails (ZERO_RESULTS — e.g. a hotspot is in a lake or car-inaccessible
  // nature reserve), snap every waypoint to its nearest point on the known drivable
  // routePath and retry. The displayed marker stays at the original SOS coordinate;
  // only the Directions API waypoint moves to the nearest road. No stops are dropped.
  const getDirections = useCallback(
    (origin: LatLng, dest: LatLng, waypoints: LatLng[], snapPath?: LatLng[]): Promise<google.maps.DirectionsResult> => {
      const attempt = (wps: LatLng[]): Promise<google.maps.DirectionsResult> =>
        new Promise((resolve, reject) => {
          if (!routesLib) return reject(new Error('Routes library not ready'))
          new routesLib.DirectionsService().route(
            {
              origin: new google.maps.LatLng(origin.lat, origin.lng),
              destination: new google.maps.LatLng(dest.lat, dest.lng),
              waypoints: wps.map((w) => ({
                location: new google.maps.LatLng(w.lat, w.lng),
                stopover: true,
              })),
              travelMode: google.maps.TravelMode.DRIVING,
            },
            (res, status) => {
              if (status === 'OK' && res) resolve(res)
              else reject(new Error(`Directions: ${status}`))
            },
          )
        })

      const run = async (): Promise<google.maps.DirectionsResult> => {
        try {
          return await attempt(waypoints)
        } catch (e) {
          if (!snapPath?.length || !waypoints.length) throw e
          // Snap each waypoint to the nearest point on the known drivable path
          return attempt(waypoints.map((w) => nearestOnPath(w, snapPath)))
        }
      }
      return run()
    },
    [routesLib],
  )

  const planRoute = useCallback(async () => {
    if (!originText.trim() || !destText.trim()) {
      setError('Enter both a starting point and a destination.')
      return
    }
    setLoadingMsg('Finding route…')
    setError(null)
    setResult(null)

    try {
      // 1 — Geocode
      const [origin, dest] = await Promise.all([
        geocodeAddress(originText),
        geocodeAddress(destText),
      ])

      // 2 — Get the direct driving route (no stops yet) and extract its path
      const directResult = await getDirections(origin, dest, [])
      const routePath = extractPath(directResult)
      const directKm = legsKm(directResult)

      // 3 — Split the route into one zone per requested stop and query each
      //     zone independently. This way every API call's 1000-record budget
      //     covers only that zone's short corridor rather than the full route.
      setLoadingMsg('Searching for hotspots…')
      const zones = zoneBboxes(routePath, stopCount)
      const sosRes = await fetch('/api/artfakta/hotspots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zones, taxonFilter }),
      })
      if (!sosRes.ok) {
        const body = await sosRes.json().catch(() => ({ error: sosRes.statusText }))
        throw new Error(body.error ?? `API error ${sosRes.status}`)
      }
      const { hotspots: rawCells } = await sosRes.json()
      const cells: Hotspot[] = rawCells.map((c: {
        id: string; lat: number; lng: number
        taxonCount: number; observationCount: number; spreadKm?: number
        name?: string
      }) => ({ ...c, spreadKm: c.spreadKm ?? 0, score: 0, detourKm: 0, placeName: c.name }))

      if (!cells.length) {
        setError('No observations found along this route. Try removing the species filter.')
        return
      }

      // 4 — Rank hotspots by proximity to the real road and biodiversity score
      const { picks: rankedPicks, pool } = rankHotspots(cells, routePath, stopCount)

      // 5 — Each hotspot already carries the observer-registered locality name from SOS.
      //     Only fall back to reverse-geocoding for any that somehow arrived without one.
      const needsName = rankedPicks.some((p) => !p.placeName)
      if (needsName) setLoadingMsg('Naming stops…')
      const picks = await Promise.all(
        rankedPicks.map(async (p) =>
          p.placeName ? p : { ...p, placeName: await reverseGeocode(p) }
        ),
      )

      // 6 — Recalculate route with the selected stops for final display.
      //     Pass routePath as snap fallback so unreachable stops are snapped
      //     to the nearest drivable road point rather than causing ZERO_RESULTS.
      const finalResult = picks.length
        ? await getDirections(origin, dest, picks, routePath)
        : directResult

      // 7 — Replace the estimated per-stop detourKm (2 × perpendicular to simplified
      //     polyline) with accurate values derived from actual Google Directions legs.
      //     For stop i: extra = (leg_i + leg_{i+1}) − haversine(leg_i.start, leg_{i+1}.end)
      //     Haversine gives a lower bound for direct driving so this slightly over-estimates,
      //     but is far better than the straight-line ×2 approximation.
      const legs = finalResult.routes[0]?.legs ?? []
      const picksWithDetour = picks.map((p, i) => {
        const legBefore = legs[i]
        const legAfter  = legs[i + 1]
        if (!legBefore || !legAfter) return p
        const segKm = ((legBefore.distance?.value ?? 0) + (legAfter.distance?.value ?? 0)) / 1000
        const directSeg = haversine(
          { lat: legBefore.start_location.lat(), lng: legBefore.start_location.lng() },
          { lat: legAfter.end_location.lat(),    lng: legAfter.end_location.lng()    },
        )
        return { ...p, detourKm: Math.max(0, Math.round(segKm - directSeg)) }
      })

      setResult({
        picks: picksWithDetour,
        pool,
        routePath,
        directionsResult: finalResult,
        origin,
        dest,
        directKm,
        extraKm: Math.max(0, legsKm(finalResult) - directKm),
        totalTaxa: picksWithDetour.reduce((s, p) => s + p.taxonCount, 0),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoadingMsg(null)
    }
  }, [originText, destText, stopCount, taxonFilter, geocodeAddress, reverseGeocode, getDirections])

  const clearResults = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  const replaceStop = useCallback(async (idx: number) => {
    if (!result?.pool.length) return

    const count = result.picks.length
    const targetT = (idx + 1) / (count + 1)
    const next = result.pool
      .slice()
      .sort((a, b) => {
        const da = Math.abs((a.routeT ?? 0.5) - targetT)
        const db = Math.abs((b.routeT ?? 0.5) - targetT)
        return da !== db ? da - db : b.score - a.score
      })[0]

    if (!next) return
    setReplacingStop(idx)

    try {
      const placeName = next.placeName ?? await reverseGeocode(next)
      const newStop: Hotspot = { ...next, placeName }
      const newPicks = result.picks.map((p, i) => (i === idx ? newStop : p))
      const newPool = result.pool
        .filter((c) => c.id !== next.id)
        .concat({ ...result.picks[idx] })

      // Recalculate route with the updated stop list
      const newDirections = await getDirections(result.origin, result.dest, newPicks, result.routePath)

      // Recalculate per-stop detour from actual legs (same logic as planRoute step 7)
      const newLegs = newDirections.routes[0]?.legs ?? []
      const picksWithDetour = newPicks.map((p, i) => {
        const legBefore = newLegs[i]
        const legAfter  = newLegs[i + 1]
        if (!legBefore || !legAfter) return p
        const segKm = ((legBefore.distance?.value ?? 0) + (legAfter.distance?.value ?? 0)) / 1000
        const directSeg = haversine(
          { lat: legBefore.start_location.lat(), lng: legBefore.start_location.lng() },
          { lat: legAfter.end_location.lat(),    lng: legAfter.end_location.lng()    },
        )
        return { ...p, detourKm: Math.max(0, Math.round(segKm - directSeg)) }
      })

      setResult((prev) => prev && {
        ...prev,
        picks: picksWithDetour,
        pool: newPool,
        directionsResult: newDirections,
        extraKm: Math.max(0, legsKm(newDirections) - prev.directKm),
        totalTaxa: picksWithDetour.reduce((s, p) => s + p.taxonCount, 0),
      })

      panToStop(next)
    } finally {
      setReplacingStop(null)
    }
  }, [result, reverseGeocode, getDirections])

  const openInGoogleMaps = useCallback(() => {
    if (!result) return
    const enc = encodeURIComponent
    const origin = `${result.origin.lat},${result.origin.lng}`
    const dest = `${result.dest.lat},${result.dest.lng}`
    const waypoints = result.picks.map((p) => `${p.lat},${p.lng}`).join('|')
    const url = `https://www.google.com/maps/dir/?api=1&origin=${enc(origin)}&destination=${enc(dest)}&waypoints=${enc(waypoints)}&travelmode=driving`
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [result])

  const loading = loadingMsg !== null

  const panToStop = useCallback((stop: Hotspot) => {
    if (!map) return
    map.panTo({ lat: stop.lat, lng: stop.lng })
  }, [map])

  return (
    <Group align="flex-start"  gap="md" wrap={'wrap'}>

      {/* ── Form + results panel ───────────────────────────────────────────── */}
      <Paper bg="white" radius="md" p={0} w={400} style={{ overflow: 'hidden', flexShrink: 0 }} withBorder>
        <Stack gap={0}>

          <Group px="md" py="sm" justify="space-between">
            <Group gap="xs">
              <IconLeaf size={16} color="var(--mantine-color-green-6)" />
              <Title order={6}>Planera rutt</Title>
            </Group>
            {result && (
              <ActionIcon variant="subtle" color="gray" size="sm" onClick={clearResults}>
                <IconX size={14} />
              </ActionIcon>
            )}
          </Group>

          <Divider />

          <Stack gap="xs" px="md" py="sm">
            <TextInput
              ref={originRef}
              size="sm"
              placeholder="Startpunkt…"
              autoComplete="off"
              leftSection={<IconMapPin size={14} color="var(--mantine-color-green-6)" />}
              value={originText}
              onChange={(e) => setOriginText(e.currentTarget.value)}
            />
            <TextInput
              ref={destRef}
              size="sm"
              placeholder="Destination…"
              autoComplete="off"
              leftSection={<IconMapPin size={14} color="var(--mantine-color-red-6)" />}
              value={destText}
              onChange={(e) => setDestText(e.currentTarget.value)}
            />
          </Stack>

          <Divider />

          <Stack gap="xs" px="md" py="sm">
            <Text size="xs" c="dimmed" tt="uppercase" fw={500} style={{ letterSpacing: '0.05em' }}>
              Antal stopp längs vägen
            </Text>
            <Group gap="xs">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <ActionIcon
                  key={n}
                  size="sm"
                  variant={stopCount === n ? 'filled' : 'default'}
                  color={stopCount === n ? 'green' : 'gray'}
                  onClick={() => setStopCount(n)}
                >
                  <Text size="xs">{n}</Text>
                </ActionIcon>
              ))}
            </Group>

            <Text size="xs" c="dimmed" tt="uppercase" fw={500} style={{ letterSpacing: '0.05em' }}>
              Artfokus
            </Text>
            <SegmentedControl
              size="xs"
              value={taxonFilter}
              onChange={(v) => setTaxonFilter(v as TaxonFilter)}
              data={[
                { label: 'All', value: 'all' },
                { label: 'Birds', value: 'bird' },
                { label: 'Insects', value: 'insect' },
                { label: 'Plants', value: 'plant' },
              ]}
            />
          </Stack>

          <Divider />

          <Stack gap="xs" px="md" py="sm">
            <Button
              fullWidth
              size="sm"
              color="green"
              loading={loading}
              leftSection={!loading && <IconArrowDown size={14} />}
              onClick={planRoute}
              disabled={!geocoder || !routesLib}
            >
              {loadingMsg ?? 'Plan route'}
            </Button>
            {error && <Text size="xs" c="red">{error}</Text>}
          </Stack>

          {result && (
            <>
              <Divider />
              <Group px="md" py="xs" gap="lg">
                <Stack gap={0}>
                  <Text size="xs" c="dimmed">Direct</Text>
                  <Text size="sm" fw={500}>{result.directKm} km</Text>
                </Stack>
                <Stack gap={0}>
                  <Text size="xs" c="dimmed">Extra</Text>
                  <Text size="sm" fw={500}>~{result.extraKm} km</Text>
                </Stack>
                <Stack gap={0}>
                  <Text size="xs" c="dimmed">Taxa at stops</Text>
                  <Text size="sm" fw={500}>{result.totalTaxa}</Text>
                </Stack>
              </Group>

              <Stack px="md" pb="sm">
                <Button
                  fullWidth
                  size="xs"
                  variant="light"
                  color="blue"
                  leftSection={<IconExternalLink size={13} />}
                  onClick={openInGoogleMaps}
                >
                  Öppna i Google Maps
                </Button>
              </Stack>

              <Divider />

              <ScrollArea.Autosize mah={360}>
                <Stack gap={0}>
                  {result.picks.map((stop, i) => (
                    <Stack
                      key={stop.id}
                      gap={4}
                      px="md"
                      py="sm"
                      onClick={() => {
                        panToStop(stop)
                      }}
                      style={{ borderBottom: '1px solid var(--mantine-color-default-border)', cursor: 'pointer' }}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                          <Badge size="xs" variant="filled" color="green" circle style={{ flexShrink: 0 }}>
                            {i + 1}
                          </Badge>
                          <Text size="xs" fw={500} truncate>
                            {stop.placeName || `${stop.lat.toFixed(3)}°N ${Math.abs(stop.lng).toFixed(3)}°${stop.lng >= 0 ? 'E' : 'W'}`}
                          </Text>
                        </Group>
                        <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
                          {result.pool.length > 0 && (
                            <ActionIcon
                              size="xs"
                              variant="subtle"
                              color="gray"
                              loading={replacingStop === i}
                              onClick={(e) => { e.stopPropagation(); replaceStop(i) }}
                              title="Try next best stop in this segment"
                            >
                              <IconRefresh size={12} />
                            </ActionIcon>
                          )}
                          <Badge size="xs" variant="light" color="orange">
                            +{stop.detourKm} km
                          </Badge>
                        </Group>
                      </Group>

                      <Group gap="xs">
                        <Badge size="xs" variant="light" color="green">
                          {stop.taxonCount} taxa
                        </Badge>
                      </Group>

                      <Progress value={Math.round(stop.score * 100)} size="xs" color="green" />
                    </Stack>
                  ))}
                </Stack>
              </ScrollArea.Autosize>

              <Text size="10px" c="dimmed" px="md" py="xs">
                SLU Artdatabanken · SOS API · verified obs, last 5 years
              </Text>
            </>
          )}
        </Stack>
      </Paper>

      {/* ── Map preview ────────────────────────────────────────────────────── */}
      <Paper
        shadow="sm"
        radius="md"
        style={{
          overflow: 'hidden',
          flex: 1,
          minWidth: '300px',
          height: result ? 580 : 220,
          transition: 'height 0.35s ease',
        }}
      >
        <Map
          style={{ width: '100%', height: '800px' }}
          defaultCenter={{ lat: 59.5, lng: 17.0 }}
          defaultZoom={6}
          gestureHandling="cooperative"
          disableDefaultUI
          mapId="route-planner-preview"
          id={'route-planner-preview'}
        >
          {result && (
            <>
              <DirectionsLayer directionsResult={result.directionsResult} />

              {/* Origin */}
              <AdvancedMarker position={result.origin} title={result.origin.formatted}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'var(--mantine-color-green-6)',
                    border: '2.5px solid white',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  }} />
                  <div style={{
                    width: 0, height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: '8px solid var(--mantine-color-green-6)',
                    marginTop: -1,
                  }} />
                </div>
              </AdvancedMarker>

              {/* Destination */}
              <AdvancedMarker position={result.dest} title={result.dest.formatted}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'var(--mantine-color-red-6)',
                    border: '2.5px solid white',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  }} />
                  <div style={{
                    width: 0, height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: '8px solid var(--mantine-color-red-6)',
                    marginTop: -1,
                  }} />
                </div>
              </AdvancedMarker>

              {/* Hotspot markers */}
              {result.picks.map((stop, i) => (
                <AdvancedMarker
                  key={stop.id}
                  position={stop}
                  title={stop.placeName ?? `Stop ${i + 1}`}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                    <div style={{
                      background: 'var(--mantine-color-green-6)',
                      color: 'white',
                      borderRadius: '50%',
                      width: 26, height: 26,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                      border: '2.5px solid white',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                    }}>
                      {i + 1}
                    </div>
                    <div style={{
                      width: 0, height: 0,
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: '9px solid var(--mantine-color-green-6)',
                      marginTop: -1,
                    }} />
                  </div>
                </AdvancedMarker>
              ))}
            </>
          )}
        </Map>
      </Paper>

    </Group>
  )
}

export default RoutePlanner
