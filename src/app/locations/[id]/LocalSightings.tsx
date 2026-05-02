'use client'
import SingleSighting from "@/components/cards/SingleSighting"
import { Location } from "@/interfaces/location"
import { Card, Divider, LoadingOverlay, ScrollArea, Title } from "@mantine/core"
import { useEffect, useState } from "react"

const LocalSightings = ({ location }: { location: Location }) => {
  const [sightings, setSightings] = useState<any>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)

  useEffect(() => {
    fetchSightings()
  }, [location.id])

  useEffect(() => {
    fetchSightings()
  }, [page])

  const fetchSightings = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/artfakta/nearby/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          page: page,
          radius: location.radius ? location.radius * 1000 :  5000
        }),
      })
      const data = await response.json()
      setSightings([...sightings, ...data])
    } catch (error) {
      console.error("Error fetching local sightings:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <Title order={3} mb="md">
        Externa obsar
      </Title>
      <Divider mb="md" />
      <LoadingOverlay visible={loading} />
      <ScrollArea onBottomReached={() => {
        setPage(page + 1)
      }} style={{ height: 400 }} >
        {sightings.map((sighting: any, index:number) => (
          <SingleSighting key={index} sighting={sighting} />
        ))}
      </ScrollArea>
    </Card>
  )
}

export default LocalSightings