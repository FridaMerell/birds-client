
'use client'
import { Box, Button, Card, Slider, Space, Text } from '@mantine/core'
import { AdvancedMarker, APIProvider, ControlPosition, Map, Pin, useMap } from '@vis.gl/react-google-maps'
import { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import { Circle } from './Radius'

type MapControlProps = PropsWithChildren<{
  position: ControlPosition
}>

const MapControl = ({
  children,
  position
}: MapControlProps) => {
  const controlContainer = useMemo(() => document.createElement('div'), [])
  const map = useMap('location-map')
  useEffect(() => {
    if (!map) return

    const controls = map.controls[position]

    controls.push(controlContainer)

    return () => {
      const controlsArray = controls.getArray()
      // controlsArray could be undefined if the map is in an undefined state (e.g. invalid API-key, see #276
      if (!controlsArray) return

      const index = controlsArray.indexOf(controlContainer)
      controls.removeAt(index)
    }
  }, [controlContainer, map, position])

  return createPortal(children, controlContainer)
}

const LocationMap = ({ location, editable, onChange }: { location: any, editable: boolean, onChange?: (location: any) => void }) => {
  const [fetchingLocation, setFetchingLocation] = useState(false)

  const getCurrentLocation = () => {
    setFetchingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        if (onChange)
          onChange({ ...location, latitude: lat, longitude: lng })

        setFetchingLocation(false)
      })
    }
  }

  return (
    <Map
      
    colorScheme='DARK'
    mapId={'49ae42fed52588c3'}
      id="location-map"
      defaultZoom={
        location.radius && location.radius > 0 ?
          Math.max(
            8,
            Math.min(
              15,
              14 - Math.floor(Math.log2(location.radius / 1000))
            )
          ) : 12
      }
      defaultCenter={
        location.latitude && location.longitude ? { lat: location.latitude, lng: location.longitude } :
          {
            lat: 59.3824965,
            lng: 16.4969365
          }}
      style={{ width: '100%', height: '500px' }}
      gestureHandling={'greedy'}>
      {(location.latitude && location.longitude) && (
        <AdvancedMarker
          position={{ lat: location.latitude, lng: location.longitude }}
          draggable={editable}
          onDragEnd={(e) => {
            if (onChange)
              onChange({ ...location, latitude: e.latLng?.lat() || 0, longitude: e.latLng?.lng() || 0 })
          }}>
          <Circle
            radius={location.radius}
            center={location.latitude && location.longitude ? { lat: location.latitude, lng: location.longitude } : undefined}
            onRadiusChanged={(changeRadius) => {
              if (onChange)
                onChange({
                  ...location,
                  radius: changeRadius
                })
            }}
            onCenterChanged={(changeCenter) => {
              if (onChange)
                onChange({
                  ...location,
                  latitude: changeCenter?.lat() || 0,
                  longitude: changeCenter?.lng() || 0
                })

                console.log("center changed", {
                  latitude: changeCenter?.lat() || 0,
                  longitude: changeCenter?.lng() || 0
                })
            }}
            strokeColor={'#0c4cb3'}
            strokeOpacity={1}
            strokeWeight={3}
            fillColor={'#3b82f6'}
            fillOpacity={0.3}
            editable={editable}
            draggable={editable}
          />
        </AdvancedMarker>
      )}
      {editable && (
        <MapControl position={5}>
          <Card p={10} w={200}>
            <Text>Radie</Text>
            <Slider value={location.radius}
              step={1000}
              max={50000}
              onChange={(e) => {
                if (onChange)
                  onChange({
                    ...location,
                    radius: e
                  })
              }}></Slider>
            <Space h={10} />
            <Button onClick={getCurrentLocation} loading={fetchingLocation} >
              Hitta mig
            </Button>
          </Card>
        </MapControl>
      )}
    </Map>)
}

const WrapMap = ({ location, editable, onChange }: { location: any, editable: boolean, onChange?: (location: any) => void }) => {
  return (<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
    <LocationMap location={location} editable={editable} onChange={onChange} />
  </APIProvider>)
}

export default WrapMap