import { Card as CardType } from "@/interfaces/card"
import { User } from "@/interfaces/user"
import { Card, Group, MultiSelect, Select, Stack, TextInput } from "@mantine/core"
import { DateInput } from "@mantine/dates"
import { useEffect, useState } from "react"

const CardInfo = ({ card, callback }: { card: CardType, callback: (card: CardType) => void }) => {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    // Fetch users from the server
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/user/list')
        if (response.ok) {
          const data = await response.json()
          setUsers(data.users ?? [])
        } else {
          console.error('Failed to fetch users')
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
  }, [])

  return <Card >
    <Stack gap={15}>

      <TextInput label="Namn" placeholder="Namn på kortet" value={card.name} onChange={(e) => {
        callback({ ...card, name: e.currentTarget.value })
      }} />
      <Group grow>
        <DateInput label="Startdatum" placeholder="Välj startdatum" value={card.start} onChange={(date) => {
          callback({ ...card, start: date })
        }} />
        <DateInput label="Slutdatum" placeholder="Välj slutdatum" value={card.ends} onChange={(date) => {
          callback({ ...card, ends: date })
        }} />
      </Group>
      <MultiSelect label="Medlemmar" placeholder="Välj medlem" multiple
        data={users.filter(u => u.id && u.username).map(user => ({ value: user.id?.toString() ?? '', label: user.username ?? user.email ?? "" }))}
        value={card.subscribers?.map(s => s.id?.toString() ?? '') || []}
        onChange={(values) => {
          const selectedUsers = users.filter(u => u.id && values.includes(u.id.toString()))
          callback({ ...card, subscribers: selectedUsers })
        }}
      />

    </Stack>
  </Card>
}

export default CardInfo