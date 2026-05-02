'use client'
import { useDispatch, useSelector } from "react-redux"
import { User } from '@/interfaces/user'
import { useTheme } from '@emotion/react'
import Logo from "../app/Logo"
import Link from "next/link"
import { ActionIcon, Anchor, Avatar, Box, Button, Flex, GridCol, Menu, NavLink, Portal, SegmentedControl, SimpleGrid, Stack, useComputedColorScheme, useMantineColorScheme } from "@mantine/core"
import { IconSun, IconMoon, IconMenu2, IconMenu3, IconMenu4, IconMenuDeep } from '@tabler/icons-react'
import { useInterval, useMounted } from "@mantine/hooks"
import { sign } from "crypto"
import QuickObserve from "./common/QuickObserve"
import { useEffect, useLayoutEffect } from "react"
import { refreshAuthToken } from "@/lib/api/helper"
import { setUser } from "@/lib/features/userSlice"

const Header = () => {
  const user = useSelector((state: any) => state.user.user) as User | null
  const isMounted = useMounted()
  const { setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const dispatch = useDispatch()
  const interval = useInterval(() => {
    refreshUser()
  }, 180000) // 3 minutes

  useEffect(() => {
    if (user && user.id) {
      interval.start()
    } else {
      interval.stop()
    }
    return () => interval.stop()
  }, [user])

  const refreshUser = async () => {
    let retult = await fetch('/api/user/token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (retult.ok) {
      let data = await retult.json()
      // update user in redux
      dispatch(setUser(data))
    }
  }

  const signOut = async () => {
    await fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    window.location.href = '/login'
  }

  return <>
    <SimpleGrid cols={{
      base: 2, md: 3
    }} px={45} py={15}>

      <Logo />
      <Flex visibleFrom="md" justify={'center'} align={'center'} gap={15} fz={24}>
        <Anchor<'a'>
          href="/glutt"
          variant="link"
          underline="hover"
          fz={19}
        >
          Glutt
        </Anchor>
        <Anchor<'a'>
          href="/taxon"
          variant="link"
          underline="hover"
          fz={19}

        >
          Taxonomier
        </Anchor>
        <Anchor<'a'>
          href="/card"
          variant="link"
          fz={19}
          underline="hover"
        >
          Kort
        </Anchor>
        <Anchor<'a'>
          href="/locations"
          fz={19}
          variant="link"
          underline="hover"
        >
          Platser
        </Anchor>
      </Flex>

      <Flex justify={'flex-end'} align={'center'} gap={15}>
        {
          (isMounted && !user?.id) &&
          <ActionIcon
            onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
            variant="default"
            size="xl"
            aria-label="Toggle color scheme"
          >
            {
              computedColorScheme === 'light' ?
                <IconSun stroke={1.5} />
                :
                <IconMoon stroke={1.5} />
            }
          </ActionIcon>
        }
        {
          user && user.id ?
            <>
              <Box hiddenFrom="md">
                <Menu withArrow  >
                  <Menu.Target>
                    <ActionIcon
                      variant="default"
                      size="xl"
                    >
                      <IconMenu2 />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown miw={200}>
                    <Menu.Label>Navigering</Menu.Label>
                    <Menu.Divider />
                    <Menu.Item>
                      <Anchor href="/glutt">
                        Glutt
                      </Anchor>
                    </Menu.Item>
                    <Menu.Item>
                      <Anchor href="/taxon">
                        Taxonomier
                      </Anchor>
                    </Menu.Item>
                    <Menu.Item>
                      <Anchor href="/card">
                        Kort
                      </Anchor>
                    </Menu.Item>
                    <Menu.Item>
                      <Anchor href="/locations">
                        Platser
                      </Anchor>
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Box>
              <Menu withArrow>
                <Menu.Target>
                  <Avatar src={undefined}
                    name={user.username || user.email}
                    alt={user.username || user.email} radius="xl" />
                </Menu.Target>
                <Menu.Dropdown miw={200}>

                  <Menu.Item>
                    <SegmentedControl fullWidth
                      value={computedColorScheme}
                      onChange={(value) => setColorScheme(value as 'light' | 'dark')}
                      data={[
                        {
                          value: 'light',
                          label: (
                            <Stack align="center" gap={0}>
                              <IconSun size={16} />
                            </Stack>
                          ),
                        },
                        {
                          value: 'dark',
                          label: (
                            <Stack align="center" gap={0}>

                              <IconMoon size={16} />
                            </Stack>),
                        },
                      ]}
                    >

                    </SegmentedControl>
                  </Menu.Item>
                  <Menu.Divider />

                  <Menu.Item >
                    <Anchor href="/user">
                      Profil
                    </Anchor>
                  </Menu.Item>
                  <Menu.Item color="red" onClick={signOut}>
                    Logga ut
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </>
            :
            <Anchor<'a'> href={"/login"}>Logga in</Anchor>
        }

      </Flex>
    </SimpleGrid>
    <Portal>
      <Box pos="fixed" bottom={30} right={30} >

        <Menu withArrow>
          <Menu.Target>
            <ActionIcon variant="default"
              size="xl">
              <IconMenuDeep />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown miw={200}>
            <Menu.Label>Snabblänkar</Menu.Label>
            <Menu.Divider />
            <Menu.Item >
              <Anchor href="/glutt/new">
                Nytt glutt
              </Anchor>
            </Menu.Item>
            <Menu.Item >
              <Anchor href="/glutt?user=me">
                Mina gluttar
              </Anchor>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

      </Box>
    </Portal>
  </ >
}


export default Header