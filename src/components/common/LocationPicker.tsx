'use client'
import { useSpeciesContext } from "@/providers/SpeciesProvider"
import { Select } from "@mantine/core"
import { useEffect, useState } from "react"

const LocationPicker = ({callback}: {callback: (locationId: string | null) => void}) => {
  const [locationId, setLocationId] = useState<string | null>(null)
  const { locations, fetchLocations } = useSpeciesContext()
  const getDefaultLocationId = () => {
    let storedLocationId = localStorage.getItem('observe_latest_locationId')
    return storedLocationId || null
  }
  useEffect(() => {
    fetchLocations()
  }, [])

  useEffect(() => {
    let defaultLocationId = getDefaultLocationId()
    setLocationId(defaultLocationId)
  }, [])

  useEffect(() => {
    callback(locationId)
  }, [locationId])

  return <Select
    clearable
    label="Plats för observation"
    data={
      locations.map((location: any) => {
        return { value: location.id.toString(), label: location.name }
      })
    }
    defaultValue={locationId}
    onChange={(value) => setLocationId(value)}
  ></Select>
}

export default LocationPicker