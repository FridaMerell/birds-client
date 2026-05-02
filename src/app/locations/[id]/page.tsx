import Metadata from "@/components/common/Metadata"
import { authorizedFetch } from "@/lib/api/helper"
import { Button, Divider, Flex, SimpleGrid, Stack, Title } from "@mantine/core"
import LocationMap from "@/components/location/Map"
import { IconEdit } from "@tabler/icons-react"
import LocalSightings from "./LocalSightings"
import InternalSightings from "./InternalSightings"
const Page = async ({ params }: { params: { id: string } }) => {
  const id = (await params).id
  const locationResponse = await authorizedFetch.get(`/locations/${id}`).catch((error) => {
    console.error("Error fetching location:", error)
    return null
  })

  if (!locationResponse?.data.id) {
    return <div>Platsen hittades inte</div>
  }

  const location = locationResponse.data

  const sightings = await authorizedFetch.get(`/sightings?location=${id}`).then((response) => {
    return response.data
  }).catch((error) => {
    console.error("Error fetching sightings:", error)
    return []
  })

  return <Stack my={30}>
    <Metadata title={`Plats: ${location.name}`} description={`Information om platsen ${location.name}`} />
    <Flex align="center" justify={'space-between'}>
      <Title order={1} mb="md">
        Plats: {location.name}
      </Title>
      <Button component="a" href={`/locations/${location.id}/edit`} leftSection={<IconEdit />}>
        Redigera plats
      </Button>
    </Flex>
    <Divider mb="md" />
    <SimpleGrid
      cols={{ sm: 1, md: 2, lg: 3 }}
    >
      <LocationMap location={location} editable={false} />
      <LocalSightings location={location} />
      <InternalSightings sightings={sightings} />
    </SimpleGrid>
  </Stack>
}

export default Page