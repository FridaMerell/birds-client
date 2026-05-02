'use client'
import { Button, Card, Chip, Divider, Flex, LoadingOverlay, ScrollArea, Text, ThemeIcon, Title } from "@mantine/core"
import { useEffect, useLayoutEffect, useState } from "react"
import { useSelector } from "react-redux"
import SingleSighting from "./SingleSighting"

const Subscribed = () => {
  const user = useSelector((state: any) => state.user.user)
  const [loading, setLoading] = useState(false)
  const [sightings, setSightings] = useState([] as any[])
  const [useGeoLocation, setUseGeoLocation] = useState(false)
  const [geoLocation, setGeoLocation] = useState({
    latitude: 0,
    longitude: 0
  })

  useEffect(() => {
    if (!user?.id) return

    loadSightings()

  }, [user, useGeoLocation])

  useLayoutEffect(() => {

    // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const { latitude, longitude } = coords

      setGeoLocation({ latitude, longitude })
    }, (error) => {
      console.error(error)
    })
  }, [])

  const loadSightings = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      let url = "/api/artfakta/followed"
      if (useGeoLocation && geoLocation.latitude && geoLocation.longitude) {
        url += `?latitude=${geoLocation.latitude}&longitude=${geoLocation.longitude}`
      }
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })
      const data = await response.json()
      setSightings(data || [])
    } catch (err) {
      console.error("Failed to fetch followed species.")
    } finally {
      setLoading(false)
    }
  }

  return <Card shadow="sm" padding="lg">
    <Flex justify={'space-between'} align={'center'}>

      <Title order={3}>Arter du följer</Title>
      <Chip
        checked={useGeoLocation}
        onChange={(event) => setUseGeoLocation(!useGeoLocation)}

        style={{ marginLeft: "1rem" }}
      >
        I närheten
      </Chip>
    </Flex>
    <Divider my={10} />
    <ScrollArea h={400}>
      <LoadingOverlay visible={loading} />
      {
        sightings.map((sighting: any, index: number) => (
          <SingleSighting key={index} sighting={sighting} />
        ))
      }
    </ScrollArea>
  </Card>
}
export default Subscribed