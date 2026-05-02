
import { unauthorizedFetch } from "@/lib/api/helper"
import { Stack, Flex, Breadcrumbs, Anchor, Title, Button, Text, SimpleGrid, Divider, ThemeIcon, Grid, GridCol, ScrollArea, Group, ActionIcon, CheckIcon, AppShell, AppShellAside, Box } from "@mantine/core"
import SingleSpecies from "./SingleSpecies"
import QuickObserve from "@/components/common/QuickObserve"
import Metadata from "@/components/common/Metadata"

export const dynamic = 'force-dynamic'
const Page = async ({ params, searchParams }:
  {
    params: { slug: string }
    searchParams?: { [key: string]: string | string[] | undefined }
  }
) => {
  const id = (await params).slug
  const card = (await unauthorizedFetch('/card/' + id)).data
  const families = (await unauthorizedFetch('/card/families/' + id)).data
  



  return (

    <Stack gap="xl" p={20}>
      <Metadata title={"Krysskort " + card.name} description={"Se arter i krysskortet " + card.name + " och registrera dina observationer direkt här."} />
      <Flex >
        <Breadcrumbs separator="/">
          <Anchor<'a'> href="/card">
            <Text >
              Krysskort
            </Text>
          </Anchor>
          <Anchor<'a'> href={`/card/${card.id}`}>
            <Text>
              {card.name}
            </Text>
          </Anchor>

        </Breadcrumbs>
      </Flex>
      <Stack gap={
        'md'
      }>
        <Title order={1} tt={'capitalize'}>
          {card.name}
        </Title>
      </Stack>
      <Divider />
      <Stack gap="md">
        <QuickObserve />
        {
          Object.keys(card.speciesByFamily).map((familyName: string) => {
            const speciesList = card.speciesByFamily[familyName]
            return <div key={familyName}>
              <Title order={2} tt={'capitalize'} id={familyName}>
                {familyName}
              </Title>
              <SimpleGrid cols={{
                sm: 2,
                md: 3,
                lg: 4,
                xl: 6
              }} spacing={20} mb={30}>
                {speciesList.map((species: any) => {
                  const observed = species.hasSighting
                  return <SingleSpecies key={species.id} species={species} observed={observed} />
                })}
              </SimpleGrid>
            </div>
          })
        }
      </Stack>
    </Stack>
  )
}


export default Page