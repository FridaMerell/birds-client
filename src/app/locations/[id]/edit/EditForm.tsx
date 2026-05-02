'use client'

import { Location } from "@/interfaces/location"
import { useEffect, useState } from "react"
import LocationMap from "@/components/location/Map"
import { saveLocation, setLocations } from "@/lib/features/appSlice"
import { Button, Card, Divider, Flex, SimpleGrid, Stack, TextInput, Title } from "@mantine/core"
import { useDispatch } from "react-redux"
import { AppDispatch } from "@/lib/store"
import Metadata from "@/components/common/Metadata"
import { notifications } from "@mantine/notifications"
const EditForm = ({ location }: { location: Location }) => {
  const [newLocation, setNewLocation] = useState<Location>(location)
  const [savedLocation, setSavedLocation] = useState<Location>(location)
  const dispatch = useDispatch<AppDispatch>()
useEffect(() => {
  console.log("New location:", newLocation)
}, [newLocation])
  const save = async () => {
    try {
      await dispatch(saveLocation(newLocation)).unwrap().then((savedLoc) => {
        setSavedLocation(savedLoc)
        notifications.show({
          title: "Plats sparad",
          message: `Platsen ${savedLoc.name} har sparats.`,
          color: "green",
        })
      })
    } catch (error) {
      console.error("Failed to save location:", error)
      notifications.show({
        title: "Fel vid sparande",
        message: `Platsen ${newLocation.name} kunde inte sparas. Troligen är du ett pucko`,
        color: "red",
      })
    }
  }

  return (<>
    <Metadata title={`Plats: ${savedLocation.name}`} description={`Information om platsen ${savedLocation.name}`} />
    <Title order={1} mb="md">
      Plats: {savedLocation.name}
    </Title>
    <Divider mb="md" />
    <Flex gap={20} direction={{ sm: 'column', md: 'row' }}>
      <Card w={500}>
        <TextInput w={300} label="Namn" value={newLocation.name} onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })} />
        <Button mt={20} onClick={save} disabled={!newLocation.name || !newLocation.latitude || !newLocation.longitude}>Spara ändringar</Button>
      </Card>
      <LocationMap location={newLocation} editable={true} onChange={setNewLocation} />
    </Flex>
  </>
  )
}

export default EditForm