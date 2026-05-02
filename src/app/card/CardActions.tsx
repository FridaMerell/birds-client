'use client'

import { Card } from "@/interfaces/card"
import { User } from "@/interfaces/user"
import { ActionIcon, Button, Flex } from "@mantine/core"
import { IconEdit, IconEye } from "@tabler/icons-react"
import { useSelector } from "react-redux"

const CardActions = ({ card }: { card: Card }) => {
  const user = useSelector((state: any) => state.user.user as User)
  return (
    <Flex align="center">
      <ActionIcon variant="filled" size={'lg'} component="a" href={'/card/' + card.id} radius="md" >
        <IconEye />
      </ActionIcon>
      <ActionIcon variant="outline" size={'lg'} component="a" href={'/card/edit/' + card.id} radius="md" ml={10} disabled={!user?.id} >
        <IconEdit />
      </ActionIcon>
    </Flex>)
}

export default CardActions
