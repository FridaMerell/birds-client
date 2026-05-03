
'use client'
import { ActionIcon, Anchor, Avatar, Collapse, Divider, Flex, Group, NavLink, ScrollArea, Stack, Text, ThemeIcon, Title, useMantineTheme } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useSelector } from "react-redux"
import Logo from "./Logo"
import useCurrentUser from "@/hooks/useCurrentUser"
import classes from './Navigation.module.css'
import { IconBinoculars, IconDeviceAudioTape, IconLeaf, IconList, IconLogout, IconMap, IconMapPin, IconSearch } from "@tabler/icons-react"
import { IoMdClose } from "react-icons/io"
import { AiOutlineMenu } from "react-icons/ai"
import React, { ReactNode, useEffect } from "react"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import { RiAccountCircleLine } from "react-icons/ri"
import { PiSignIn } from "react-icons/pi"
import { GiRaspberry } from "react-icons/gi"
import QuickSearch from "@/components/common/QuickSearch"

const Navigation = () => {
  const [open, { toggle, close: closeNav }] = useDisclosure(false)
  const [searchOpen, { open: openSearch, close: closeSearch }] = useDisclosure(false)
  const user = useCurrentUser()
  const theme = useMantineTheme()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()

  useEffect(() => {
    if (!user.state.user) {
      user.refreshUser()
    }
  }, [])

  const navLinks = <ScrollArea h={'calc(100vh - 200px)'} >
    <NavLink
      className={classes.menuLink}

      active={
        pathname === '/glutt' || pathname?.startsWith('/glutt/')
      }
      bdrs={8}
      childrenOffset={0}
      leftSection={<IconBinoculars />}
      label={open && <Text>Glutt</Text>}
      onClick={!open ? (() => {
        router.push('/glutt')
      }) : undefined}
    >
      {open && <>
        <NavLink href="/glutt"

          label='Alla glutts'
          className={classes.subMenuLink}
        />
        <NavLink href="/glutt/new" label='Ny glutt' active={pathname === '/glutt/new'}
          className={classes.subMenuLink}
        />
      </>}
    </NavLink>
    <NavLink
      className={classes.menuLink}

      active={
        pathname === '/taxon' || pathname?.startsWith('/taxon/')
      }
      bdrs={8}
      childrenOffset={0}
      leftSection={<IconLeaf />}
      label={open && <Text>Taxonomier</Text>}
      onClick={!open ? (() => {
        router.push('/taxon')
      }) : undefined}
    >
      {open && <>
        <NavLink href="/taxon" label='Alla taxonomier'
          active={
            pathname === '/taxon'
          }
          className={classes.subMenuLink}
        /></>
      }</NavLink>
    <NavLink
      className={classes.menuLink}


      active={
        pathname === '/card' || pathname?.startsWith('/card/')
      }
      bdrs={8}

      childrenOffset={0}
      leftSection={<IconList />}
      label={open && <Text>Krysskort</Text>}
      onClick={!open ? (() => {
        router.push('/card')
      }) : undefined}
    >
      {open && <>
        <NavLink href="/card" label='Alla krysskort'
          className={classes.subMenuLink}
          active={pathname === '/card'}
        />
        <NavLink href="/card/new" label='Nytt krysskort'
          className={classes.subMenuLink}
          active={pathname === '/card/new'}
        />
      </>}
    </NavLink>
    <NavLink
      className={classes.menuLink}

      active={pathname === '/locations' || pathname?.startsWith('/locations/')}
      bdrs={8}
      childrenOffset={0}
      leftSection={<IconMapPin />}
      label={open && <Text>Platser</Text>}
      onClick={() => {
        if (!open)
          router.push('/locations')
      }}
    >
      {open && <>
        <NavLink href="/locations" label='Alla platser'
          className={classes.subMenuLink}
          active={pathname === '/locations'}
        />
        <NavLink href="/locations/new" label='Ny plats'
          className={classes.subMenuLink}
          active={pathname === '/locations/new'}
        />
      </>}
    </NavLink>
    <NavLink
      className={classes.menuLink}

      active={
        pathname === '/route-planner' || pathname?.startsWith('/route-planner/')
      }
      href={'/route-planner'}
      bdrs={8}
      childrenOffset={0}
      leftSection={<IconMap />}
      label={open && <Text>Planera rutt</Text>}
    ></NavLink>
    <NavLink
      className={classes.menuLink}

      active={
        pathname === '/device-stream' || pathname?.startsWith('/device-stream/')
      }
      href={'/device-stream'}
      bdrs={8}
      childrenOffset={0}
      leftSection={<IconDeviceAudioTape />}
      label={open && <Text>BirdnetStream</Text>}
    ></NavLink>
  </ScrollArea>

  return <><Stack className={classes.navigation + (open ? ' ' + classes.navigationOpen : '')} gap={30}>
    <Group wrap="nowrap" gap={10} justify={open ? 'flex-start' : 'center'}>
      <Logo width={40} />
      <Collapse in={open}  >
        <Stack p={5} gap={5} c={'primary.5'}>
          <Title size="xl" fw={700} lh={1} c={'green.3'} >Börds</Title>
          <Text size="sm" c="dimmed">v2.0.0</Text>
        </Stack>
      </Collapse>
      <button onClick={toggle} className={classes.navBurger} >
        {
          open ? <IoMdClose /> : <AiOutlineMenu />
        }
      </button>
    </Group>
    <Divider w={'100%'} />
    {navLinks}

    <Divider w={'100%'} />
    <NavLink
      className={classes.menuLink}
      bdrs={8}
      childrenOffset={0}
      leftSection={<IconSearch />}
      label={open && <Text>Hitta art</Text>}
      onClick={() => { openSearch(); closeNav() }}
    />
    <Group bg={'dark.4'} align={'center'} justify={'center'} bdrs={8} c={'green.4'} p={8} wrap="nowrap" w={'100%'}>
      {
        user.state.user?.username ?
          <Group w={'100%'} justify={open ? 'space-between' : 'center'} wrap="nowrap" >
            <Avatar size={'sm'} variant="light" bg={'green.5'} color={'dark.9'} name={user?.state.user?.username ?? 'NA'} />
            <Collapse w={'100%'} in={open} keepMounted={false} >
            <Flex justify={'space-between'} align={'center'}>

              <div>
                <Text size="md" mt={5}>{user?.state.user?.username}</Text>
                <Text size="sm" c="dimmed" title={user?.state.user?.email}>
                  {user?.state.user?.email && user.state.user.email.length > 20
                    ? user.state.user.email.substring(0, 40) + '...'
                    : user?.state.user?.email}
                </Text>
              </div>

              <ActionIcon size={'lg'} onClick={() => {
                user.clearUser()
              }} >
                <IconLogout fontSize={19} />
              </ActionIcon>
                </Flex>

            </Collapse>
          </Group>
          :
          <Group w={'100%'} justify={open ? 'flex-start' : 'center'} wrap="nowrap" align={'center'}>
            <ThemeIcon size="lg" mt={5} onClick={() => {
              router.push('/login')
            }} >
              <RiAccountCircleLine fontSize={'20'} />
            </ThemeIcon>
            <Collapse in={open}> <Stack gap={5} >
              <Anchor href="/login" size="md" mt={5} >Logga in</Anchor>
            </Stack>
            </Collapse>
          </Group>
      }
    </Group>
  </Stack >
  <QuickSearch opened={searchOpen} onClose={closeSearch} />
  <button onClick={toggle} className={classes.mobileToggle} aria-label="Toggle navigation">
    {open ? <IoMdClose /> : <AiOutlineMenu />}
  </button>
</>
}

export default Navigation