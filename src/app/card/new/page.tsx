import CardForm from "@/components/cards/form/CardForm"
import { authorizedFetch } from "@/lib/api/helper"
import { Divider, Stack, Title } from "@mantine/core"

const Page = async () => {

    return <Stack py={20}>
        <Title order={1}>Skapa krysskort</Title>
        <Divider my="sm" />
        <CardForm  />
    </Stack>
}

export default Page 