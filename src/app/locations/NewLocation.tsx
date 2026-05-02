'use client'
import LocationMap from "@/components/location/Map"
import { AppDispatch } from "@/lib/store"
import { ActionIcon, Box, Button, Modal, Portal, TextInput } from "@mantine/core"
import { IconDeviceFloppy, IconPlus } from "@tabler/icons-react"
import { APIProvider } from "@vis.gl/react-google-maps"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { saveLocation as appSaveLocation } from "@/lib/features/appSlice"
import { notifications } from "@mantine/notifications"

const NewLocation = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const user = useSelector((state: any) => state.user.user)
  const dispatch = useDispatch<AppDispatch>()
  const [newLocation, setNewLocation] = useState({ name: '', latitude: 0, longitude: 0, radius: 500 })
  if (!user?.id) {
    return <></>
  }


  const saveLocation = async () => {
    try {
      await dispatch( appSaveLocation(newLocation)).unwrap().then(() => {
        setModalOpen(false)
        notifications.show({
          title: "Plats sparad",
          message: `Platsen ${newLocation.name} har sparats.`,
          color: "green",
        })
      })
    } catch (error) {
      console.error("Failed to save location:", error)
      notifications.show({
        title: "Fel vid sparande",
        message: `Platsen ${newLocation.name} kunde inte sparas.`,
        color: "red",
      })
    }
  }

  return (
    <>
      <Portal>
        <Box pos="fixed" bottom={90} right={30} >
          <ActionIcon size={'xl'} onClick={() => setModalOpen(true)}><IconPlus /></ActionIcon>
        </Box>
      </Portal>
      <Modal opened={modalOpen} size={'xl'} onClose={() => setModalOpen(false)} title="Lägg till ny plats">
        <TextInput mb={20} label="Platsens namn" value={newLocation.name} onChange={(e) => setNewLocation({ ...newLocation, name: e.currentTarget.value })} />
        <LocationMap location={newLocation} editable={true} onChange={(location) => {
          setNewLocation(location)
        }} />

        <Button mt={20} onClick={saveLocation} disabled={!newLocation.name || !newLocation.latitude || !newLocation.longitude} leftSection={<IconDeviceFloppy />}>Spara plats</Button>
      </Modal>
    </>)

}

export default NewLocation