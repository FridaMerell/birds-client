'use client'
import { Card } from "@/interfaces/card"
import { Box, Flex, Grid, LoadingOverlay, Card as MantineCard, ScrollArea, SimpleGrid, UnstyledButton } from "@mantine/core"
import classes from './SpeciesController.module.css'
import { Family } from "@/interfaces/taxon/family"
import { useEffect, useState } from "react"
import cx from 'clsx'
import { Species } from "@/interfaces/taxon/species"

const SpeciesController = ({ card }: { card: Card }) => {
  const [activeFamily, setActiveFamily] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [families, setFamilies] = useState<Family[]>([])
  const [speciesList, setSpeciesList] = useState<Species[]>([])

  useEffect(() => {
    load()
  }, [])


  useEffect(() => {
    fetchSpeciesForFamily
  }, [activeFamily])

  const load = async () => {
    // const families = await fetch('/api') 
  }

  const fetchSpeciesForFamily = async (familyId: string) => {
    setLoading(true)
    const response = await fetch('/api/taxon/species?taxonomy=' + familyId)
    if (response.ok) {
      const species = await response.json()
      return species
    } else {
      console.error('Failed to fetch species for family:', familyId)
      return []
    }
    setLoading(false)
  }

  return <MantineCard withBorder>
    <Flex mb="md" align="center" justify="space-between">

      <ScrollArea miw={200} h={400}>

        {card.speciesByFamily && Object.entries(card.speciesByFamily).map(([familyId, familyData]: [string, any], index: number) => {
          const family = familyData as Family
          return <Box<'a'> key={familyId}
            component="a"
            tt={'capitalize'}
            href={'#'}
            className={cx(classes.link, { [classes.linkActive]: activeFamily === index })}
            onClick={async () => {
              setActiveFamily(index)
            }}
            style={{ paddingLeft: `var(--mantine-spacing-md)` }}>
            {familyId}
          </Box>
        })}

      </ScrollArea>
      <ScrollArea miw={400} h={400}>
        <LoadingOverlay visible={loading} />
        <SimpleGrid cols={3} spacing="md">

          {card.speciesByFamily && Object.entries(card.speciesByFamily).map(([familyId, familyData]: [string, any], index: number) => {
            const speciesList = familyData as Species[]
            return <div key={familyId} style={{ display: activeFamily === index ? 'block' : 'none', paddingLeft: `var(--mantine-spacing-md)` }}>
              {speciesList.map((species) => (
                <UnstyledButton className={classes.speciesButton}>
                  {species.vernacularName}
                </UnstyledButton>
              ))}

            </div>
          })}
        </SimpleGrid>
      </ScrollArea>

    </Flex>
  </MantineCard >
}

export default SpeciesController