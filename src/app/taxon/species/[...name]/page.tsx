import { authorizedFetch, unauthorizedFetch } from "@/lib/api/helper"
import { getGeoGridAggregation, getSoundsForSpecies, getSpecies } from "@/lib/artdatabanken"
import { Divider, SimpleGrid, Spoiler, Stack, Text, Title } from "@mantine/core"
import SpeciesTitle from "./SpeciesTitle"
import SpeciesInformation from "./SpeciesInformation"
import QuickObserve from "@/components/common/QuickObserve"

const getSpeciesData = async (taxonomyId: string) => {
  try {

    let species = await getSpecies(taxonomyId)
    return species
  } catch (error) {
    console.error("Failed to fetch species data.", error)
    return null
  }
}


const Page = async ({ params }: { params: { name: string[] } }) => {
  const name = (await params).name
  const species = await unauthorizedFetch(`/species/${name[name.length - 1]}`).catch((error) => {
  
    return null
  })
  if (!species?.data) {
    return <div>Species not found</div>
  }
  const speciesDataResponse = (await getSpeciesData(species.data.taxonomyId))
  let speciesData = speciesDataResponse ? speciesDataResponse[0].speciesData : null
  const sounds = await getSoundsForSpecies(species.data.scientificName)
  const metricGridAggregate = await getGeoGridAggregation([species.data.taxonomyId], 5)
  console.log("metricGridAggregate", metricGridAggregate)
  return <Stack gap="xl" p={20}>
    <SpeciesTitle species={species.data} />
    <Divider />
    {speciesData &&
      <SpeciesInformation speciesData={speciesData} geogridData={metricGridAggregate} sounds={sounds?.recordings || []} />
    }
  </Stack>
}


export default Page