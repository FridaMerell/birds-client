'use client'
import { ActionIcon, Button, Card, Group, Indicator, SimpleGrid, Text } from "@mantine/core"
import { IconTrash } from "@tabler/icons-react"
import { useSelector } from "react-redux"

const Taxonomies = ({ currentTaxon, slug }: { currentTaxon: any, slug: string[] }) => {
  const {user} = useSelector((state: any) => state.user)

console.log('currentTaxon', currentTaxon)
  return <SimpleGrid cols={3} spacing={20} >
    {currentTaxon.children?.map((child: any) => (
      <Card key={child.id} shadow="sm" padding="lg">
        <Group mb={20}>

          <Text component="a" href={`/taxon/${[...slug, child.scientificName].join('/')}`} tt={'capitalize'}>
            {child.vernacularName || child.scientificName}
          </Text>
          <Text c="dimmed">
            ({child.scientificName})
          </Text>
        </Group>
        <Group>
          <Button component="a" href={`/taxon/${[...slug, child.scientificName].join('/')}`}>
            Visa
          </Button>

          <Indicator label={child.speciesCount} size={16} color="gray.8">
            <Button component="a" href={`/taxon/${[...slug, child.scientificName, 'species'].join('/')}`}>
              Visa arter
            </Button>
          </Indicator>
        </Group>
        {user?.id &&
          <Group mt={15}>
            <ActionIcon size={'lg'} onClick={() => {
              fetch('/api/taxon/?taxonomy=order&taxonomyId=' + child.taxonomyId, {
                method: 'DELETE',
              })
            }}>
              <IconTrash />
            </ActionIcon>
          </Group>
        }
      </Card>
    ))}
  </SimpleGrid>

}

export default Taxonomies