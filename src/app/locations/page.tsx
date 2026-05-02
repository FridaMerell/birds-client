import { unauthorizedFetch } from "@/lib/api/helper"
import { Card, Divider, Group, Indicator, SimpleGrid, Stack, Title } from "@mantine/core"
import { IconPhotoPin } from "@tabler/icons-react"
import { Location } from "@/interfaces/location"
import SingleLocation from "./SingleLocation"
import List from "./List"
import NewLocation from "./NewLocation"

const getLocations = async () => {
  const response = await unauthorizedFetch('/locations/').catch((error) => {
    console.error("Error fetching locations:", error)
    return { data: [] }
  })
  return response.data
}

const Page = async () => {
  const locations = await getLocations()


  return <Stack gap={20} my={30}>
    <Group align="center">
      <Title order={1} mb="md">
        Platser</Title>
    </Group>
    <Divider mb="md" />
    <List initialLocations={locations} />
    <NewLocation />
  </Stack>
}

export default Page