'use client'
import { Species } from "@/interfaces/taxon/species"
import { TaxClass } from "@/interfaces/taxon/taxclass"
import { Box, Button, Flex, Group, LoadingOverlay, Modal, NumberInput, SimpleGrid, Stack, TextInput } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { IconCloudDownload, IconDeviceFloppy, IconLoader3 } from "@tabler/icons-react"
import { set } from "lodash"
import { useState } from "react"
import { PiDownload, PiUploadSimple } from "react-icons/pi"

const AddSpecies = ({ taxon }: { taxon: TaxClass }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [species, setSpecies] = useState<Species>({
    taxonomyId: null,
    vernacularName: '',
    scientificName: '',
    swedishProminence: '',
    taxClassId: taxon.scientificName || 0,
  })


  const syncWithArtDatabanken = async () => {
    setLoading(true)
    // Fetch species data from ArtDatabanken API
    const response = await fetch('/api/taxon/sync/species/' + species.taxonomyId, {
      method: 'GET'
    })
    if (response.status === 404) {
      notifications.show({
        title: 'Art ej funnen',
        message: 'Ingen art hittades med angivet ID',
        color: 'red',
        position: 'top-right'
      })
      return
    } else {
      const responseData = await response.json()
      setSpecies({
        ...species,
        vernacularName: responseData.swedishName,
        scientificName: responseData.scientificName,
        swedishProminence: responseData.speciesData.swedishPresence,

      })
    }
    setLoading(false)
  }

  const save = async () => {
    setLoading(true)
    try {
    await fetch('/api/taxon/species', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(species),
    })
    setOpen(false)
    } catch (error) {
      console.error('Error saving species:', error)
    } finally {
      setLoading(false)
    }
  }

  return (<>
    <Modal size={'xl'} opened={open} onClose={() => setOpen(false)} title={"Lägg till ny art i " + taxon.vernacularName}>
      <LoadingOverlay visible={loading} />
      <SimpleGrid cols={{
        base: 1,
        md: 2
      }} spacing="md">
        <Flex align={'flex-end'} gap={5} >
          <NumberInput label="Taxonomi ID" value={species.taxonomyId || 0} onChange={(value) => setSpecies({ ...species, taxonomyId: parseInt(value.toString()) ?? null })} />
          <Button
            disabled={!species.taxonomyId}
            onClick={syncWithArtDatabanken}
          >
            <IconCloudDownload />
          </Button>
        </Flex>
        <TextInput label="Vetenskapligt namn" value={species.scientificName} onChange={(e) => setSpecies({ ...species, scientificName: e.currentTarget.value })} />
        <TextInput label="Svenskt namn" value={species.vernacularName} onChange={(e) => setSpecies({ ...species, vernacularName: e.currentTarget.value })} />
        <TextInput label="Svensk förekomst" value={species.swedishProminence} onChange={(e) => setSpecies({ ...species, swedishProminence: e.currentTarget.value })} />
        <Box>
          <Button mt={10}
            disabled={!species.scientificName || !species.vernacularName || !species.taxonomyId}
            onClick={save} rightSection={<IconDeviceFloppy />}>Spara</Button>
        </Box>

      </SimpleGrid>
    </Modal>
    <Button variant="light" color="green" mt={10} onClick={() => setOpen(true)}>Ny art</Button>
  </>
  )
}

export default AddSpecies