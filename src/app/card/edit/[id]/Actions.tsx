'use client'
import { Card } from "@/interfaces/card"
import { Button, Flex, Group } from "@mantine/core"
import { DateInput } from "@mantine/dates"
import { notifications } from "@mantine/notifications"
import { IconTrash } from "@tabler/icons-react"
import { useRouter } from "next/navigation"

const Actions = ({ card }: { card: Card }) => {
  const router = useRouter()
  const deleteCard = async () => {
    let response = await fetch('/api/cards/' + card.id, {
      method: 'DELETE'
    })
    if (response.ok) {
      notifications.show({
        title: 'Success',
        message: 'Card deleted successfully',
        color: 'green'
      })
      // Optionally, you can add logic to redirect or update the UI after deletion
      router.push('/card')
    } else {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete card',
        color: 'red'
      })
    }
  }
  return <Flex gap="md">
  
    <Button onClick={deleteCard} leftSection={<IconTrash />}>Radera</Button>
  </Flex>

}

export default Actions