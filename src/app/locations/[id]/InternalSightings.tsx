import { Location } from "@/interfaces/location"
import { Sighting } from "@/interfaces/sighting"
import { Card, ScrollArea, Stack, Text, Title } from "@mantine/core"
import { isDate, isStringObject } from "util/types"

const InternalSightings = ({ sightings }: { sightings: Sighting[] }) => {
  return <Card>
    <Title order={3} mb="md">
      Obsar på platsen
    </Title>
    <ScrollArea style={{ height: 400 }} >
      <Stack gap="md">
        {sightings.map((sighting: Sighting) => (
          <Card withBorder key={sighting.id} component="a" href={`/glutt/view/${sighting.id}`}>
            <Text >{sighting.species?.vernacularName} ({sighting.species?.scientificName})</Text>

            <Text c={'dimmed'} size="xs"> {(sighting.dateTime) ? (new Date(sighting.dateTime)).toLocaleDateString() : "Invalid date"}</Text>
          </Card>
        ))}
      </Stack>
    </ScrollArea>
  </Card>
}

export default InternalSightings