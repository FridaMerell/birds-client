'use client'
import { useSpeciesContext } from "@/providers/SpeciesProvider"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { Box, Button, Group, LoadingOverlay, Modal, Select, SimpleGrid, Text, ThemeIcon } from "@mantine/core"
import { DateTimePicker } from "@mantine/dates"
import { useDisclosure } from "@mantine/hooks"
import { IconCalendar, IconDeviceFloppy } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { notifications } from '@mantine/notifications'

const QuickObserve = () => {
  const { state: { user } } = useCurrentUser()
  const { quickObserveSpecies: species, setQuickObserveSpecies, locations, fetchLocations } = useSpeciesContext()
  const [isOpen, { close, open }] = useDisclosure(false)
  const [isLoading, setIsLoading] = useState(false)

  const [timestamp, setTimestamp] = useState<Date | null>(null)
  const [locationId, setLocationId] = useState<string | null>(null)

  useEffect(() => {
    fetchLocations()
  }, [])

  useEffect(() => {
    setTimestamp(getDefaultTimestamp())
    setLocationId(getDefaultLocationId())
  }, [open])

  useEffect(() => {
    if (timestamp) {
      localStorage.setItem('observe_latest_timestamp', timestamp.toISOString())
    }
    if (locationId) {
      localStorage.setItem('observe_latest_locationId', locationId)
    } else {
      localStorage.removeItem('observe_latest_locationId')
    }
  }, [timestamp, locationId])

  useEffect(() => {
    console.log('species changed in QuickObserve:', species)
    if (species) {
      open()
      console.log('opened modal for species:', species)
    }
  }, [species])

  const handleObserve = async () => {
    setIsLoading(true)
    if (!species) {
      notifications.show({
        title: 'Ingen art vald',
        message: 'Välj en art innan du registrerar glutten.',
        color: 'red'
      })
      setIsLoading(false)
      return
    }
    let result = await fetch('/api/observations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        speciesId: species.scientificName,
        locationId: locationId ? parseInt(locationId) : null,
        timestamp: timestamp ? timestamp.toISOString() : new Date().toISOString(),
        description: null
      }),
    })

    if (result.status === 201) {
      notifications.show({
        title: 'Observation registrerad',
        message: `Glutten är reggad!`,

      })
    } else {
      notifications.show({
        title: 'Fel vid registrering',
        message: `Något gick fel vid registreringen av glutten.`,
        color: 'red'
      })
    }

    setIsLoading(false)
  }

  const getDefaultTimestamp = () => {
    if (!localStorage || typeof localStorage.getItem !== 'function') return null
    let defaultTimestamp = localStorage.getItem('observe_latest_timestamp')
    if (defaultTimestamp) {
      return new Date(defaultTimestamp)
    } else {
      return new Date()
    }
  }

  const getDefaultLocationId = () => {
    if (!localStorage || typeof localStorage.getItem !== 'function') return null
    let defaultLocationId = localStorage.getItem('observe_latest_locationId')
    if (defaultLocationId) {
      return defaultLocationId
    } else {
      return null
    }
  }

  const closeModal = () => {
    close()
    setQuickObserveSpecies(null)
  }


  if (!user || !species) {
    return null
  }

  return (
    <Modal size={'lg'} opened={isOpen} onClose={closeModal} title={<Text size="2xl" fw={700}>Registrera glutt på {species.vernacularName}</Text>}>
      <LoadingOverlay visible={isLoading} />
      <Box py={'md'}>
        <SimpleGrid cols={2} w={'100%'}>
          <DateTimePicker
            w={250}
            highlightToday
            label="Tidpunkt för observation"
            defaultValue={getDefaultTimestamp()}
            maxDate={new Date()}
            onChange={(e: string | null) => {
              if (e) {
                setTimestamp(new Date(e))
              } else {
                setTimestamp(null)
              }
            }}
            rightSection={<ThemeIcon variant="light"><IconCalendar /></ThemeIcon>}
          />
          <Select
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
        </SimpleGrid>
        <Group mt={'xl'}>
          <Button
            rightSection={<IconDeviceFloppy size={18} />}
            onClick={() => {
              handleObserve()
              close()
            }}>Registrera</Button>
          <Button variant="outline" onClick={close}>Avbryt</Button>
        </Group>
      </Box>
    </Modal>
  )
}

export default QuickObserve