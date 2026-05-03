'use client'
import { Accordion, AccordionItem, Avatar, Badge, Box, Button, Chip, Collapse, Divider, Flex, Group, Modal, ScrollArea, SimpleGrid, Spoiler, Stack, Text, Title } from "@mantine/core"
import { IconTextCaption } from "@tabler/icons-react"
import { useState } from "react"
import { PiAcorn, PiBird, PiKnife, PiMapPin, PiMapPinArea, PiSpeakerHifi, PiTextAUnderline, PiUserSound, PiWarning } from "react-icons/pi"
import GeogridData from "./map/GeogridData"

const SpeciesInformation = ({ speciesData, sounds, geogridData }: { speciesData: any, sounds: any[], geogridData: any }) => {
  const [biotopesOpen, setBiotopesOpen] = useState(false)
  const [soundsToShow, setSoundsToShow] = useState(5)
  const [soundsOpen, setSoundsOpen] = useState(false)
  return <SimpleGrid cols={{
    base: 1,
    sm: 1,
    md: 3
  }} spacing={50}>
    <Stack gap="md">
      <Accordion defaultValue={['description']} multiple>
        <Accordion.Item value="description">
          <Accordion.Control >
            <Flex align="center" gap={15}>
              <Avatar>
                <IconTextCaption size={24} />
              </Avatar>
              <Text size="xl">Beskrivning</Text>
            </Flex>
          </Accordion.Control>
          <Accordion.Panel>
            <Text>{speciesData.speciesFactText.characteristic}</Text>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="redlist">
          <Accordion.Control >
            <Flex align="center" gap={15}>
              <Avatar>
                <PiWarning size={24} />
              </Avatar>
              <Stack gap={0}>
                <Text size="xl">Rödlistning</Text>
                <Text c="dimmed" size="sm">{speciesData.redlistInfo[0].category}</Text>
              </Stack>
            </Flex>
          </Accordion.Control>
          <Accordion.Panel>
            <Text>{speciesData.redlistInfo[0].criterionText}</Text>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="spread">
          <Accordion.Control >
            <Flex align="center" gap={15}>
              <Avatar>
                <PiMapPinArea size={24} />
              </Avatar>
              <Text size="xl">Utbredning</Text>
            </Flex>
          </Accordion.Control>
          <Accordion.Panel>
            <Text>{speciesData.speciesFactText.spreadAndStatus}</Text>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="habitat">
          <Accordion.Control >
            <Flex align="center" gap={15}>
              <Avatar>
                <PiAcorn size={24} />
              </Avatar>
              <Text size="xl">Ekologi</Text>
            </Flex>
          </Accordion.Control>
          <Accordion.Panel>
            <Text>{speciesData.speciesFactText.ecology}</Text>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="threats">
          <Accordion.Control >
            <Flex align="center" gap={15}>
              <Avatar>
                <PiKnife size={24} />
              </Avatar>
              <Text size="xl">Hot</Text>
            </Flex>
          </Accordion.Control>
          <Accordion.Panel>
            <Text>{speciesData.speciesFactText.threat}</Text>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

    </Stack>
    <Stack>
      <div>
        <Title order={4} mb={10}>Svensk förekomst</Title>
        <Badge variant={speciesData.taxonRelatedInformation.swedishPresence === 'Bofast och reproducerande' ? 'filled' : "light"} fw={500} size="lg" tt={'none'} mr={5} >{speciesData.taxonRelatedInformation.swedishPresence}</Badge>
      </div>
      <div>
        <Title order={4} mb={10}>Landskap</Title>
        {
          speciesData.landscapeTypes.map((landscape: any, index: number) => (
            <Badge variant={landscape.status === "Stor betydelse" ? 'filled' : "light"}
              title={landscape.status}
              fw={500} tt={'none'} size="lg" key={index} mr={5}>{landscape.name}</Badge>
          ))
        }
      </div>
      <div>
        <Title order={4} mb={10}>Substrat</Title>
        <Flex wrap={'wrap'} gap={5} >

          {speciesData.substrateInformation?.map((substrate: any, index: number) => (
            <Badge variant={substrate.significance === "Viktigt" ? 'filled' : "light"}
              title={substrate.significance}
              fw={500} tt={'none'} size="lg" key={index} mr={5}>{substrate.name}</Badge>
          ))}
        </Flex>
      </div>
      <div>
        <Title order={4} mb={10}>Biotoper</Title>


        <Flex wrap={'wrap'} gap={5} >

          {
            speciesData.biotopes.map((landscape: any, index: number) => (
              <Badge variant={landscape.significance === "Viktig" ? 'filled' : "light"}
                title={landscape.significance}
                fw={500} tt={'none'} size="lg" key={index} mr={5}>{landscape.name}</Badge>
            ))
          }
        </Flex>
      </div>

    </Stack>

    <Stack>
      {
        sounds.length > 0 &&
        <Button leftSection={<PiBird />} variant="light" size="lg" mb={10} onClick={() => setSoundsOpen(!soundsOpen)}>
          Ljudinspelningar ({sounds.length})
        </Button>
      }
      <Modal opened={soundsOpen} onClose={() => setSoundsOpen(false)} size="lg" title="Ljudinspelningar">
        {sounds.length === 0 && <Text>Inga ljudinspelningar hittades för denna art.</Text>
        }
        <ScrollArea py={15} style={{ height: '60vh' }}>
          <Stack gap={10}>

            {
              sounds.slice(0, soundsToShow).map((sound: any, index: number) => {
                return <Group bd={'1px solid green.7'} p={5} bdrs={15} key={index}>
                  <audio controls >
                    <source src={sound.file} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                  <Title order={4} size="sm" c="dimmed">{sound.type}, {sound.cnt}</Title>

                </Group>
              })
            }
          {soundsToShow < sounds.length && <Button mx={'auto'} mt={20} variant="light" onClick={() => setSoundsToShow(soundsToShow + 5)}>Ladda fler</Button>}
          </Stack>
        </ScrollArea>
      </Modal>
      <div>
        <Title order={4} mb={10}>Rapporter sedan {(new Date()).getFullYear() - 1}</Title>
        <GeogridData geogridData={geogridData} />
      </div>

    </Stack>
  </SimpleGrid>
}

export default SpeciesInformation