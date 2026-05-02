
'use client'
import { TaxClass } from "@/interfaces/taxon/taxclass"
import { ActionIcon, Box, Button, Modal, NumberInput, Portal, TextInput } from "@mantine/core"
import { useState } from "react"
import { RiAddLargeFill } from "react-icons/ri"
import { useSelector } from "react-redux"

const NewClass = () => {
  const [open, setOpen] = useState(false)
  const user =  useSelector((state:any) => state.user.user)
  const [taxClass, setClass] = useState<TaxClass>({
    taxonomyId: 0,
    scientificName: '',
    vernacularName: '',
    icon: '',
  })

  const saveClass = async () => {
    await fetch('/api/taxon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taxClass),
    })
    setOpen(false)
  }

  if (!user || !user.id) {
    return <></>
  }
  return <>
    <Modal opened={open} onClose={() => setOpen(false)} title="Lägg till klass/kategori">
      <Box>
        <NumberInput label="Taxonomi ID" mb={10} value={taxClass.taxonomyId} onChange={(value) => setClass({ ...taxClass, taxonomyId: parseInt(value.toString()) ?? 0 })} />
        <TextInput label="Vetenskapligt namn" mb={10} value={taxClass.scientificName} onChange={(e) => setClass({ ...taxClass, scientificName: e.currentTarget.value })} />
        <TextInput label="Svenskt namn" mb={10} value={taxClass.vernacularName} onChange={(e) => setClass({ ...taxClass, vernacularName: e.currentTarget.value })} />
        <Button mt={30}
        disabled={!taxClass.scientificName || !taxClass.vernacularName || !taxClass.taxonomyId}
        onClick={saveClass}>Spara</Button>
      </Box>
    </Modal>
    <Portal >
      <Box pos="fixed" bottom={90} right={30} >
        <ActionIcon size={'xl'} onClick={() => setOpen(true)}><RiAddLargeFill></RiAddLargeFill></ActionIcon>
      </Box>
    </Portal>
  </>
}

export default NewClass