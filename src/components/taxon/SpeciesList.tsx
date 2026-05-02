"use client"
import Search from "@/app/taxon/[...slug]/search"
import { Species } from "@/interfaces/taxon/species"
import { Stack, Title, List, ListItem, Text, SimpleGrid, Card, Pagination, Group, ActionIcon, Flex, Box, Anchor } from "@mantine/core"
import { useEffect, useState } from "react"
import SpeciesFilters from "./SpeciesFilters"
import { spec } from "node:test/reporters"
import { IconStar, IconStarFilled, IconStarOff } from "@tabler/icons-react"
import { notifications } from "@mantine/notifications"
import { useSelector } from "react-redux"


const SpeciesList = ({ taxon }: { taxon: any }) => {
  const [style, setStyle] = useState<'grid' | 'list'>('grid')
  const [speciesList, setSpeciesList] = useState<any[]>([])
  let [total, setTotal] = useState<number>(0)
  const user = useSelector((state: any) => state.user)
  const [currentPage, setCurrentPage] = useState<number>(1)
  useEffect(() => {
    getStyle()
    loadSpecies(1, {})
  }, [])

  const loadSpecies = async (page: number, filters: any) => {
    let query = `/api/taxon/species?taxonomy=${taxon.taxonomyId}&page=${page}`

    const response = await fetch(query)
    const data = await response.json()
    let list = []
    Array.isArray(data.data) ?
      list = data.data
      : list = [data.data]
    setSpeciesList(list)
    setTotal(data.meta?.totalItems || list.length)
    setCurrentPage(data.meta?.currentPage || 1)
    console.log('data', list[0])

  }

  const getStyle = () => {
    let savedStyle = localStorage.getItem('speciesListStyle')
    if (savedStyle === 'grid' || savedStyle === 'list') {
      setStyle(savedStyle)
    }
  }

  const subscribeToSpecies = async (species: string, status: boolean) => {
    try {

      let result = await fetch('/api/taxon/species/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ species, status }),
      })

      if (result.ok) {
        notifications.show({
          title: status ? 'Prenumeration aktiverad' : 'Prenumeration avaktiverad',
          message: status ? 'Du prenumererar nu på uppdateringar för denna art.' : 'Du prenumererar inte längre på uppdateringar för denna art.',
          color: 'green',
        })
        // Update species list to reflect new subscription status
        setSpeciesList((prevList) =>
          prevList.map((sp) =>
            sp.attributes.scientificName === species
              ? { ...sp, attributes: { ...sp.attributes, isSubscribed: status } }
              : sp
          )
        )
        return
      }
    } catch (error) {
      notifications.show({
        title: 'Fel vid prenumeration',
        message: 'Kunde inte ändra prenumerationsstatus för arten.',
        color: 'red',
      })
      return
    }

  }

  return (
    <>
      <Group>
        <SpeciesFilters callback={(filters) => { }} />
        <Search params={{ slug: [taxon.scientificName, 'species'] }} />
      </Group>
      <SimpleGrid cols={{
        sm: 2,
        md: 3,
        lg: 4,
        xl: 6
      }} py={20}>

        {speciesList?.map((species: any) => (
          <Card withBorder shadow="sm"  key={species.attributes.taxonomyId} padding="lg">
            <Flex gap={15} justify={'space-between'} align={'center'}>
              <Anchor href={"/taxon/species/" + species.attributes.scientificName}  >

                <Title order={5} tt={'capitalize'}>
                  {species.attributes.vernacularName}
                </Title>
                <Text c="dimmed" fz="sm" tt={'capitalize'}>
                  {species.attributes.scientificName}
                </Text>
              </Anchor>
              {
                species.attributes.scientificName && user?.user?.id != undefined &&
                <ActionIcon size={'lg'} onClick={() => subscribeToSpecies(species.attributes.scientificName as string, !species.attributes.isSubscribed)}>
                  {!species.attributes.isSubscribed ? <IconStar /> : <IconStarFilled />}
                </ActionIcon>
              }
            </Flex>
          </Card>
        ))}
      </SimpleGrid>
      <Pagination total={Math.ceil(total / 20)} value={currentPage} onChange={(page) => {
        setCurrentPage(page)
        loadSpecies(page, {})
      }}

      />
    </>
  )
}

export default SpeciesList