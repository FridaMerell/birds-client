import Metadata from "@/components/common/Metadata"
import { authorizedFetch } from "@/lib/api/helper"
import { Divider, SimpleGrid, Stack, Title } from "@mantine/core"
import LocationMap from "@/components/location/Map"
import EditForm from "./EditForm"
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

  return <Stack my={30}>
    
    <EditForm location={location} />
  </Stack>
}

export default Page