import { Card as ICard } from "@/interfaces/card"
import { User } from "@/interfaces/user"
import { getCards } from "@/lib/api/cards"
import { Card, Stack, Title, Text, Flex, ThemeIcon, Button, Divider, SimpleGrid, Portal, Box, ActionIcon } from "@mantine/core"
import { IconEye, IconPlus } from "@tabler/icons-react"
import { useSelector } from "react-redux"
import CardActions from "./CardActions"

const Cards = async () => {
  const cards = await getCards()
  return <Stack gap="md" p={20}>
    <Title order={1} mb="md">Krysskort</Title>
    <Divider mb="md" />
    <SimpleGrid cols={{
      sm: 1,
      md: 2,
      lg: 3,
      xl: 4
    }}>

      {cards.map((card: ICard) => {

        return <Card key={card.id}>
          <Flex justify="space-between">
            <Stack>
              <Title order={4} tt={'capitalize'}>
                {card.name}
              </Title>
              {
                card.start && card.ends ?
                  <Text size="sm" opacity={0.8}>
                    {new Date(card.start).toLocaleDateString()} – {new Date(card.ends).toLocaleDateString()}
                  </Text>
                  : <Text size="sm" opacity={0.8}>Ingen tidsgräns</Text>

              }
            </Stack>
            <CardActions card={card} />
          </Flex>
        </Card>
      }
      )}
    </SimpleGrid>
    <Portal>
      <Box pos="fixed" bottom={90} right={30} >
        <ActionIcon component="a" href="/card/new" size="xl" >
          <IconPlus size={24} />
        </ActionIcon>
      </Box>
    </Portal>
  </Stack>
}

export default Cards