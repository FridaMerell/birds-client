'use client'

import { useSpeciesContext } from "@/providers/SpeciesProvider"
import { Species } from "@/interfaces/taxon/species"
import { ActionIcon, Group, Loader, Modal, Stack, Text, TextInput, Tooltip } from "@mantine/core"
import { IconBinoculars, IconLeaf, IconSearch, IconX } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import classes from './QuickSearch.module.css'

interface Props {
  opened: boolean
  onClose: () => void
}

const QuickSearch = ({ opened, onClose }: Props) => {
  const { searchQuery, setSearchQuery, searchResults, isSearching, setQuickObserveSpecies } = useSpeciesContext()
  const router = useRouter()

  const close = () => {
    onClose()
    setSearchQuery('')
  }

  const handleQuickObserve = (species: Species) => {
    setQuickObserveSpecies(species)
    close()
  }

  const handleGoToSpecies = (species: Species) => {
    router.push(`/taxon/species/${species.scientificName}`)
    close()
  }

  return (
    <Modal opened={opened} onClose={close} title="Hitta art" size="md">
      <TextInput
        autoFocus
        placeholder="Sök art..."
        leftSection={<IconSearch size={16} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        rightSection={
          isSearching
            ? <Loader size="xs" />
            : searchQuery
              ? <ActionIcon variant="subtle" size="sm" onClick={() => setSearchQuery('')}><IconX size={14} /></ActionIcon>
              : null
        }
      />
      <Stack mt="md" gap={4} className={classes.resultList}>
        {searchResults.length === 0 && searchQuery && !isSearching && (
          <Text c="dimmed" size="sm" ta="center" py="md">Inga resultat för "{searchQuery}"</Text>
        )}
        {searchResults.map((species) => (
          <Group key={species.id} className={classes.resultRow} justify="space-between" align="center" px="sm" py={8}>
            <div>
              <Text size="sm" fw={500}>{species.vernacularName}</Text>
              <Text size="xs" c="dimmed" fs="italic">{species.scientificName}</Text>
            </div>
            <Group gap={4}>
              <Tooltip label="Snabbregistrera glutt">
                <ActionIcon variant="subtle" color="green" onClick={() => handleQuickObserve(species)}>
                  <IconBinoculars size={18} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Gå till art">
                <ActionIcon variant="subtle" onClick={() => handleGoToSpecies(species)}>
                  <IconLeaf size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        ))}
      </Stack>
    </Modal>
  )
}

export default QuickSearch
