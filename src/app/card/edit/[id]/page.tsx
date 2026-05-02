import { Flex, Group, Stack, Title } from "@mantine/core"
import Actions from "./Actions"
import { authorizedFetch } from "@/lib/api/helper"
import { Card } from "@/interfaces/card"
import SpeciesController from "./SpeciesController"
import { useContext } from "react"

export const metadata = {
  title: 'Redigera kort',
  description: 'Redigera kort information'
}
const Page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params
  const card = (await authorizedFetch('/card/' + id)).data as Card
  console.log('card in page:', card)
  return (
    <Stack gap="md" p={20}>
      <Flex align="center" justify="space-between" my="lg">
        <Title order={1}>{card.name}</Title>
        <Actions card={card as Card} />
      </Flex>
      <SpeciesController card={card as Card} />
    </Stack>
  )
}

export default Page