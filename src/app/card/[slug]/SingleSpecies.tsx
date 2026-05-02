'use client'

import { ActionIcon, Box, Button, CheckIcon, Dialog, Flex, Group, Modal, Select, SimpleGrid, Text, ThemeIcon, Title } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useEffect, useState } from "react"
import { DateTimePicker } from '@mantine/dates'
import { IconCalendar, IconDeviceFloppy } from "@tabler/icons-react"
import dayjs from "dayjs"
import { useSpeciesContext } from "@/providers/SpeciesProvider"
import QuickObserve from "@/components/common/QuickObserve"


const SingleSpecies = ({ species, observed }: { species: any, observed: boolean }) => {
  const [hasSeen, setHasSeen] = useState(observed)
  const { setQuickObserveSpecies } = useSpeciesContext()
  const startQuickObserve = () => {
    setHasSeen(true)
    setQuickObserveSpecies(species)
  }

  return <Group key={species.id} gap={5}>
    <ActionIcon size={16} variant="filled" onClick={startQuickObserve}>
      {hasSeen ?
        <CheckIcon size={12} />
        :
        ""}
    </ActionIcon>
    <Text tt={'capitalize'}>
      {species.vernacularName}
    </Text>
  </Group>
}

export default SingleSpecies