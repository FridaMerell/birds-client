import FindSpecies from "@/components/common/FindSpecies"
import GluttForm from "@/components/glutt/GluttForm"
import { Divider, SimpleGrid, Stack, Title } from "@mantine/core"

const Page = async () => {
  return <Stack gap={40}>
    <Title mt={20} order={1}>Lägg till observation</Title>
    <Divider  />
    <GluttForm initialValues={{}}/>
  </Stack >
}

export default Page