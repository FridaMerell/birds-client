'use client'
import QuickObserve from "@/components/common/QuickObserve"
import { useSpeciesContext } from "@/providers/SpeciesProvider"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { Button, CopyButton, Flex, Group, Space, Stack, Text, Title } from "@mantine/core"
import { useDocumentTitle } from "@mantine/hooks"
import { IconCheck, IconCopy, IconEye } from "@tabler/icons-react"

const SpeciesTitle = ({ species }: { species: any }) => {
  useDocumentTitle(`${species.vernacularName || species.scientificName} - Artportalen`)
  const { state: { user } } = useCurrentUser()
  const { setQuickObserveSpecies } = useSpeciesContext()

  const startQuickObserve = () => {
    setQuickObserveSpecies(species)
  }
  return <Flex justify="space-between" direction={{ base: 'column', md: 'row' }} gap={50} align={{ base: 'space-between', md: "center" }} >
    <Stack gap="sm" >
      <Group gap={10} align="end" >

        <Title tt={'capitalize'} order={1}>
          {species.vernacularName || species.scientificName}
        </Title>
        <Text tt={'capitalize'} size={'xl'} c="dimmed">
          {species.scientificName}
        </Text>
      </Group>
      <Group>
        <CopyButton value={species.taxonomyId}>
          {({ copied, copy }) => (
            <Text c="dimmed" fz="sm" onClick={copy} style={{ cursor: 'pointer' }}>
              Taxonomi: {species.taxonomyId}
              {
                copied ?
                  <IconCheck size={12} style={{ marginLeft: 5, verticalAlign: 'middle' }} /> :
                  <IconCopy size={12} style={{ marginLeft: 5, verticalAlign: 'middle' }} />
              }
            </Text>
          )}
        </CopyButton>
      </Group>

    </Stack>
    <Flex gap={10} align="center">
      {user?.id &&
        <Button leftSection={<IconEye />} onClick={startQuickObserve}>Snabbobservation</Button>
      }
      <Button component="a" variant="outline" href={'https://artfakta.se/taxon/' + species.taxonomyId} target="_blank" rel="noopener noreferrer">Visa på Artfakta</Button>
    </Flex>
    <QuickObserve />
  </Flex>
}

export default SpeciesTitle