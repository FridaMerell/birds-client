'use server'
import SpeciesList from "@/components/taxon/SpeciesList"
import Taxonomies from "@/components/taxon/Taxonomies"
import { Order } from "@/interfaces/order"
import { authorizedFetch, unauthorizedFetch } from "@/lib/api/helper"
import { getOrderList } from "@/lib/api/taxon"
import { getTaxonomicLevel, getTaxonomicTranslation } from "@/utils/taxons"
import { Anchor, Breadcrumbs, Button, Card, Flex, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core"
import TaxonTitle from "./title"

const getTaxon = async (slug: string[]) => {
  const isSpecies = slug[slug.length - 1] === 'species'
  const taxonomicLevels = isSpecies ? slug.slice(0, -1) : slug
  const currentLevel = getTaxonomicLevel(taxonomicLevels.length - 1)

  let url = `/${currentLevel}/${taxonomicLevels[taxonomicLevels.length - 1]}`

  let taxonomy = await unauthorizedFetch(url)
  return {
    data: {
      ...taxonomy.data,
      taxonomy: currentLevel
    }, isSpecies
  }
}


const TaxClass = async ({
  params,
  searchParams,
}: {
  params: { slug: string[] }
  searchParams?: { [key: string]: string | string[] | undefined }
}) => {
  const slug = (await params).slug
  const currentTaxon = await getTaxon(slug)

  const currentLevel = getTaxonomicLevel(slug.length - 1)
  const nextLevel = getTaxonomicLevel(slug.length)
  const isSpecies = slug[slug.length - 1] === 'species' || currentLevel === 'genus'

  return (
    <Stack gap="xl" p={20}>
      <Flex >
        <Breadcrumbs separator="/">
          <Anchor<'a'> href="/taxon">
            <Text >
              Klasser
            </Text>
          </Anchor>
          {slug.map((slugPart, i) => {
            const level = getTaxonomicTranslation(getTaxonomicLevel(i))

            if (i === slug.length - 1 && isSpecies) {
              return null
            }

            return <Anchor<'a'> key={slugPart} href={`/taxon/${slug.slice(0, i + 1).join('/')}`}>
              <Text>
                {level}: {slugPart.replace(/%20/g, ' ')}
              </Text>
            </Anchor>
          })}
          {
            isSpecies && <Anchor<'a'> href={`/taxon/${slug.slice(0, -1).join('/')}`}>
              Arter
            </Anchor>
          }
        </Breadcrumbs>
      </Flex>

      <TaxonTitle taxon={currentTaxon.data} />

      {(isSpecies || currentTaxon.data.unsortedSpeciesCount > 0) &&
        <SpeciesList taxon={currentTaxon.data} />
      }
      {!isSpecies &&
        <Taxonomies currentTaxon={currentTaxon.data} slug={slug} />
      }

    </Stack>
  )
}

export default TaxClass