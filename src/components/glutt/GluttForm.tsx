'use client'

import { Button, Card, SimpleGrid, Textarea, TextInput } from "@mantine/core"
import FindSpecies from "../common/FindSpecies"
import { Sighting } from "@/interfaces/sighting"
import { useState } from "react"
import { DateTimePicker } from "@mantine/dates"
import dayjs from "dayjs"
import LocationPicker from "../common/LocationPicker"
import { notifications } from "@mantine/notifications"
import { set } from "lodash"

const GluttForm = ({ initialValues }: { initialValues?: Sighting }) => {
  const [glutt, setGlutt] = useState<Sighting>(initialValues || {
    dateTime: dayjs().toDate(),
    comment: '',
    location: undefined,
  })
  const [species, setSpecies] = useState<Array<any>>([])
  const [loading, setLoading] = useState(false)

  const saveGlutt = async () => {
    setLoading(true)
    try {
      species.map((specie) => {
        let newGlutt = { ...glutt, speciesId: specie.scientificName, }
        let response = fetch('/api/observations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newGlutt)
        })
        return response
      })

      notifications.show({
        title: 'Glutt sparad',
        message: species.length > 1 ? `${species.length} gluttar sparade` : 'Glutten har sparats',
        color: 'green'
      })
      setGlutt({
        dateTime: dayjs().toDate(),
        comment: '',
        location: undefined,
      })
      setSpecies([])
    } catch (error) {
      console.error('Error saving glutt', error)
    }
    setLoading(false)
  }

  return <Card
    maw={{
      sm: '100%',
      lg: 900
    }}
  >
    <SimpleGrid

      cols={{
        sm: 2,
        md: 2,
        lg: 2
      }}
    >
      <DateTimePicker
        label="Datum och tid"
        value={glutt.dateTime ? new Date(glutt.dateTime) : undefined}
        onChange={(date) => {
          if (date)
            setGlutt({
              ...glutt,
              dateTime: new Date(date) || undefined
            })
        }}
      />
      <LocationPicker callback={(locationId) => {
        setGlutt({
          ...glutt,
          location: locationId || undefined
        })
      }} />
      <FindSpecies callback={(species) => {
        setSpecies(species || [])
      }}
      />
      <Textarea label="Kommentar"
        value={glutt.comment || ''}
        onChange={(event) => {
          setGlutt({
            ...glutt,
            comment: event.currentTarget.value
          })
        }}
      />
    </SimpleGrid>
    <Button mt="md" loading={loading} onClick={saveGlutt} >Spara glutt</Button>
  </Card>
}

export default GluttForm