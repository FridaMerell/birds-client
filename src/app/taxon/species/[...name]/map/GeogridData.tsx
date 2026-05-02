import { AdvancedMarker, APIProvider, Map, useMap } from "@vis.gl/react-google-maps"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { type Marker, MarkerClusterer } from '@googlemaps/markerclusterer'
import { Box } from "@mantine/core"

const tileCenterLatLng = (x: number, y: number, z: number) => {
  const n = Math.pow(2, z)
  const lng = ((x + 0.5) / n) * 360 - 180
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 0.5)) / n)))
  const lat = (latRad * 180) / Math.PI
  return { lat, lng }
}

// Web Mercator helpers
const tileBoundsLatLng = (x: number, y: number, z: number) => {
  const n = Math.pow(2, z)
  const west = (x / n) * 360 - 180
  const east = ((x + 1) / n) * 360 - 180
  const north = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI
  const south = (Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n))) * 180) / Math.PI
  return { north, south, east, west }
}

const normalizeGridCell = (cell: {
  observationsCount: number
  taxaCount: number
  x: number
  y: number
  zoom: number
  boundingBox?: {
    topLeft: { latitude: number; longitude: number }
    bottomRight: { latitude: number; longitude: number }
  }
}) => {
  const key = `${cell.zoom}/${cell.x}/${cell.y}`

  // Prefer cell boundingBox center if provided, else compute from tile x/y/z
  const position = cell.boundingBox?.topLeft && cell.boundingBox?.bottomRight
    ? {
      lat:
        (cell.boundingBox.topLeft.latitude +
          cell.boundingBox.bottomRight.latitude) / 2,
      lng:
        (cell.boundingBox.topLeft.longitude +
          cell.boundingBox.bottomRight.longitude) / 2,
    }
    : tileCenterLatLng(cell.x, cell.y, cell.zoom)

  return {
    key,
    position,
    label: `${cell.observationsCount} obs`,
    count: cell.observationsCount,
    taxaCount: cell.taxaCount,
    raw: cell,
  }
}

const ClusteredGeoCells = ({ gridCells }: { gridCells: any[] }) => {
  const cells = useMemo(() => gridCells.map(normalizeGridCell), [gridCells])

  const [markers, setMarkers] = useState<{ [key: string]: Marker }>({})
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const selectedCell = useMemo(
    () => (selectedKey ? cells.find(c => c.key === selectedKey) ?? null : null),
    [cells, selectedKey]
  )

  const map = useMap()
  const clusterer = useMemo(() => {
    if (!map) return null
    return new MarkerClusterer({
      map,
      algorithmOptions: {
        maxZoom:10
      }
    })
  }, [map])

  useEffect(() => {
    if (!clusterer) return
    clusterer.clearMarkers()
    clusterer.addMarkers(Object.values(markers))
  }, [clusterer, markers])

  // Prune markers that no longer exist in the current cells
  useEffect(() => {
    setMarkers(prev => {
      const allowed = new Set(cells.map(c => c.key))
      const next: { [key: string]: Marker } = {}
      for (const k of Object.keys(prev)) {
        if (allowed.has(k)) next[k] = prev[k]
      }
      return next
    })
  }, [cells])

  const setMarkerRef = useCallback((marker: Marker | null, key: string) => {
    // Ignore null to avoid ref identity churn causing infinite updates
    if (!marker) return
    setMarkers(prev => (prev[key] === marker ? prev : { ...prev, [key]: marker }))
  }, [])

  const handleInfoWindowClose = useCallback(() => {
    setSelectedKey(null)
  }, [])

  const handleMarkerClick = useCallback((cellKey: string) => {
    setSelectedKey(cellKey)
  }, [])

  // Build bounds for the selected cell from its bounding box or tile bounds
  const selectedBounds = useMemo(() => {
    if (!selectedKey) return null
    const cell = cells.find(c => c.key === selectedKey)
    if (!cell) return null

    const raw = cell.raw as any
    const bb =
      raw?.boundingBox ??
      raw?.boundingbox ??
      raw?.boundingRect ??
      raw?.boundingrect

    const bounds = bb?.topLeft && bb?.bottomRight
      ? {
        north: bb.topLeft.latitude,
        south: bb.bottomRight.latitude,
        west: bb.topLeft.longitude,
        east: bb.bottomRight.longitude,
      }
      : tileBoundsLatLng(raw.x, raw.y, raw.zoom)

    return bounds
  }, [cells, selectedKey])

  // Imperatively draw/remove a google.maps.Rectangle for the selected cell
  const selectionOverlayRef = useRef<google.maps.Rectangle | null>(null)
  useEffect(() => {
    if (!map) return

    // Clear previous overlay
    if (selectionOverlayRef.current) {
      selectionOverlayRef.current.setMap(null)
      selectionOverlayRef.current = null
    }

    if (!selectedBounds) return

    const rect = new google.maps.Rectangle({
      bounds: selectedBounds,
      strokeColor: '#a5a697',
      strokeOpacity: 1,
      strokeWeight: 2,
      fillColor: "#a5a697",
      fillOpacity: 0.3,
      clickable: false,
      map,
    })
    selectionOverlayRef.current = rect

    return () => {
      rect.setMap(null)
      if (selectionOverlayRef.current === rect) selectionOverlayRef.current = null
    }
  }, [map, selectedBounds])

  return (
    <>
      {cells.map(cell => (
        <AdvancedMarker
          key={cell.key}
          position={cell.position}
          ref={(m) => setMarkerRef(m, cell.key)}
          onClick={() => handleMarkerClick(cell.key)}
        >
          <Box bdrs={100} px={8} py={5} bg="green.6" c="white" fz={12} style={{
            transform: 'translateY(50%)'
          }}>
            {cell.count}
          </Box>
        </AdvancedMarker>
      ))}
      {/* Rectangle overlay is managed imperatively via useEffect */}
    </>
  )
}

const GeogridData = ({ geogridData }: { geogridData: any }) => {
  const { boundingBox, gridCells } = geogridData

  const center = {
    lat:
      (boundingBox.topLeft.latitude +
        boundingBox.bottomRight.latitude) /
      2,
    lng:
      (boundingBox.topLeft.longitude +
        boundingBox.bottomRight.longitude) /
      2,
  }
  return <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
    <Map
      style={{ width: '100%', height: '500px' }}
      mapTypeId="roadmap"
      disableDefaultUI
      gestureHandling="greedy"
      colorScheme='FOLLOW_SYSTEM'
      defaultZoom={5}
      defaultCenter={center}
      mapId="geogrid-map"
    >
      <ClusteredGeoCells gridCells={gridCells} />

    </Map>
  </APIProvider>
}

export default GeogridData