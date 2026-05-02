import theme from "@/theme/theme"
import { Anchor, Card, HoverCard, Popover, Text } from "@mantine/core"

const SingleSighting = ({ sighting }: { sighting: any }) => {
  const DatetimeToLocaleString = (datetime: string) => {
    const date = new Date(datetime)
    return date.toLocaleString()
  }
  return <HoverCard withArrow position="right" shadow="md"  >
    <HoverCard.Target >
      <Card shadow="xs" withBorder padding="md" radius="md" style={{ marginBottom: "1rem" }}>
        <Text tt={'capitalize'}>{sighting.taxon.vernacularName}</Text>
        <Text>{sighting.location.municipality?.name}</Text>
        <Text size="xs">Datum: {DatetimeToLocaleString(sighting.event.startDate)}</Text>
      </Card>
    </HoverCard.Target>
    <HoverCard.Dropdown>
      <Text tt={'capitalize'}><strong>Art:</strong> {sighting.taxon.vernacularName} ({sighting.taxon.scientificName})</Text>
      <Text><strong>Plats:</strong> {sighting.location.municipality?.name}, {sighting.location.county?.name}</Text>
      <Text><strong>Datum och tid:</strong> {DatetimeToLocaleString(sighting.event.startDate)}</Text>
      <Text><strong>Antal individer:</strong> {sighting.occurrence.individualCount || 'Ej angivet'}</Text>
      {sighting.datasetName === 'Artportalen' && 
      <Anchor href={"https://artportalen.se/sighting/" + sighting.occurrence?.occurrenceId?.split(':')[4]} target="_blank" rel="noopener noreferrer" >
        Visa på Artportalen
      </Anchor>
}
    </HoverCard.Dropdown>
  </HoverCard>
}

export default SingleSighting