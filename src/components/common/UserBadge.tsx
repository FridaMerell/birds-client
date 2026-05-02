'use client'
import React, { useState } from 'react'
import { Avatar, Badge, Box, Button, Group, Loader, Stack, Text, TextInput } from '@mantine/core'
import { useCurrentUser } from '@/hooks/useCurrentUser'

const UserBadge: React.FC = () => {
  const { state, refreshUser, clearUser, updateUser, refreshToken, signOut } = useCurrentUser()
  const [name, setName] = useState('')
  const [tokenRefreshed, setTokenRefreshed] = useState<boolean | null>(null)

  const onApplyName = () => {
    if (name.trim().length > 0) {
      updateUser({ username: name.trim() })
      setName('')
    }
  }

  return (
    <Box p="md" >
      <Stack gap="xs">
        <Group justify="space-between">
          <Text fw={600}>Current User</Text>
          {state.loading && <Loader size="xs" />}
        </Group>

        {state.user ? (
          <Group>
            <Avatar radius="xl" name={state.user.username || state.user.email} />
            <Stack gap={0}>
              <Text>{state.user.username || '—'}</Text>
              <Text c="dimmed" size="sm">{state.user.email || '—'}</Text>
            </Stack>
            {state.user.verified && <Badge color="green">Verified</Badge>}
          </Group>
        ) : (
          <Text c="dimmed">Not signed in</Text>
        )}

        {state.error && (
          <Text c="red" size="sm">{state.error}</Text>
        )}

        <Group>
          <Button variant="default" onClick={refreshUser}>Refresh User</Button>
          <Button color="red" variant="light" onClick={clearUser}>Clear</Button>
          <Button variant="outline" onClick={async () => setTokenRefreshed(await refreshToken())}>Refresh Token</Button>
          <Button color="red" onClick={() => signOut('/login')}>Sign Out</Button>
        </Group>
        {tokenRefreshed !== null && (
          <Text size="xs" c={tokenRefreshed ? 'dimmed' : 'red'}>{tokenRefreshed ? 'Token refreshed' : 'Refresh failed'}</Text>
        )}

        <Group>
          <TextInput
            placeholder="Update username (local)"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <Button onClick={onApplyName}>Apply</Button>
        </Group>
      </Stack>
    </Box>
  )
}

export default UserBadge
