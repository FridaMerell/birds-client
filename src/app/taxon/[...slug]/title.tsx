'use client'
import ClassIcon from "@/components/common/ClassIcon"
import { ActionIcon, CopyButton, Group, Stack, Text, ThemeIcon, Title, Tooltip } from "@mantine/core"
import { IconCheck, IconCopy } from "@tabler/icons-react"

const TaxonTitle = ({ taxon }: { taxon: any }) => {
  return (
    <Stack gap="sm" >
      <Group gap={0} align="center">
        {
          taxon.icon && <ThemeIcon size={40} radius="md" mr={20} >
            <ClassIcon color="" icon={taxon.icon} size={30} />
          </ThemeIcon>
        }
        <Title tt={'capitalize'} order={1}>
          {taxon.vernacularName || taxon.scientificName}
        </Title>
      </Group>
      <Group>
        <CopyButton value={taxon.taxonomyId}>
          {({ copied, copy }) => (
            <Text c="dimmed" fz="sm" onClick={copy} style={{ cursor: 'pointer' }}>
              Taxonomy ID: {taxon.taxonomyId}
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
  )
}

export default TaxonTitle