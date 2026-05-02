'use client'
import ClassIcon from "@/components/common/ClassIcon"
import LocationPicker from "@/components/common/LocationPicker"
import { ActionIcon, ActionIconGroup, Box, Button, ButtonGroup, Card, Chip, Divider, Flex, Group, Menu, Pagination, Popover, Portal, SegmentedControl, SimpleGrid, Stack, Text, TextInput, ThemeIcon, Title } from "@mantine/core"
import { DateTimePicker } from "@mantine/dates"
import { IconGrid3x3, IconGrid4x4, IconGridDots, IconLayoutGrid, IconList } from "@tabler/icons-react"
import dayjs from "dayjs"
import { get } from "lodash"
import { useEffect, useState } from "react"
import { RiAddLargeLine } from "react-icons/ri"
import { useSelector } from "react-redux"

type filter = {
  user: 'me' | '',
  taxonomy: string,
  search: string,
  from: string,
  to: string,
  location: number | null
}

const List = ({ sightings, totalItems, currentPage }: { sightings: any[], totalItems: number, currentPage: number }) => {
  let [defaultView, setDefaultView] = useState('')
  const [isClient, setIsClient] = useState(false)
  const user = useSelector((state: any) => state.user)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filter, setFilter] = useState<filter>({
    user: '',
    taxonomy: '',
    search: '',
    from: '',
    to: '',
    location: null
  })

  useEffect(() => {
    setIsClient(true)
    // load filters from URL
    let urlParams = new URLSearchParams(window.location.search)
    let userParam = urlParams.get('user') || ''
    let searchParam = urlParams.get('search') || ''
    let fromParam = urlParams.get('from') || ''
    let toParam = urlParams.get('to') || ''
    let locationParam = urlParams.get('location') || null

    setFilter((prev: filter) => ({
      ...prev,
      user: userParam as 'me' | '',
      search: searchParam,
      from: fromParam,
      to: toParam,
      location: locationParam ? Number(locationParam) : null
    }))
  }, [])


  useEffect(() => {
    let storedView = localStorage.getItem('glutt_default_view')
    if (storedView) {
      setDefaultView(storedView)
    } else {
      setDefaultView('grid')
    }
  }, [])

  useEffect(() => {
    if (defaultView) {
      localStorage.setItem('glutt_default_view', defaultView)
    }
  }, [defaultView])

  const applyFilters = () => {

    window.location.href = getFilteredURL(1)
  }

  const getFilteredURL = (page?: number) => {
    let queryParams = new URLSearchParams()
    if (filter.user) {
      queryParams.append('user', filter.user)
    }
    if (filter.search) {
      queryParams.append('search', filter.search)
    }
    if (filter.from) {
      queryParams.append('from', filter.from)
    }
    if (filter.to) {
      queryParams.append('to', filter.to)
    }
    if (filter.location) {
      queryParams.append('location', filter.location.toString())
    }
    let queryString = queryParams.toString()
    let url = '/glutt' + (page ? `/${page}` : '')
    if (queryString) {
      url += `?${queryString}`
    }
    return url
  }

  if (!isClient) {
    return <></>
  }

  return <Box my={20} w={'100%'}>
    <Stack my="md" w={'100%'}>
      <Title>Gluttlista</Title>
      <Group gap={25} w="100%" justify="space-between">

        <Popover closeOnClickOutside={false} width={300} position="bottom" withArrow shadow="md" >
          <Popover.Target>
            <Button size="'sm" onClick={() => setFilterOpen(!filterOpen)} variant="outline">Filtrera</Button>
          </Popover.Target>
          <Popover.Dropdown >
            <SegmentedControl
              value={filter.user}
              onChange={(value => {
                // @ts-ignore
                setFilter((prev: filter) => ({
                  ...prev,
                  user: value
                }))
              })}
              size="sm"
              fullWidth
              data={[
                {
                  label: 'Allas',
                  value: ''
                },
                {
                  label: 'Mina',
                  value: 'user/me'
                },
              ]}
            />
            <Divider my="sm" />
            <Stack gap={10}>

              <TextInput

                size="sm"
                placeholder="Sök art..."
                value={filter.search}
                onChange={(event) => {
                  const value = event.currentTarget.value
                  setFilter((prev: filter) => ({
                    ...prev,
                    search: value
                  }))
                }}
              />
              <DateTimePicker
                clearable
                size="sm"
                placeholder="Från datum"
                value={filter.from ? new Date(filter.from) : null}
                onChange={(date) => {
                  setFilter((prev: filter) => ({
                    ...prev,
                    from: date ? dayjs(date).toISOString() : ''
                  }))
                }}
              />
              <DateTimePicker
                clearable
                size="sm"
                placeholder="Till datum"
                value={filter.to ? new Date(filter.to) : null}
                onChange={(date) => {
                  setFilter((prev: filter) => ({
                    ...prev,
                    to: date ? dayjs(date).toISOString() : ''
                  }))
                }}
              />

              <Button size="sm" variant="outline" onClick={applyFilters}>Applicera filter</Button>
            </Stack>
          </Popover.Dropdown>
        </Popover>

        <ActionIconGroup>
          <ActionIcon size="lg" variant={defaultView === 'grid' ? 'filled' : 'outline'} onClick={() => {
            setDefaultView('grid')
          }}><IconLayoutGrid /></ActionIcon>
          <ActionIcon size="lg" variant={defaultView === 'list' ? 'filled' : 'outline'} onClick={() => {
            setDefaultView('list')
          }}><IconList /></ActionIcon>
        </ActionIconGroup>

      </Group>
    </Stack>
    <Divider my="lg" />

    <SimpleGrid w={'100%'} cols={defaultView === 'grid' ? {
      sm: 2,
      md: 3,
      lg: 4
    } : 1} spacing="md">
      {sightings.map((sighting: any) => (
        <Card key={sighting.id} withBorder>
          <Flex gap={15} align="center">
            <ThemeIcon>
              <ClassIcon icon={sighting.species.classification?.icon || ''} size={21} />
            </ThemeIcon>
            <Stack gap={0}>

              <Text tt={'capitalize'}            >
                {sighting.species.vernacularName} {sighting.location?.name ? `- ${sighting.location.name}` : ''}
              </Text>

              <Text fz="sm" c="dimmed">
                {sighting.user?.username || 'Okänd användare'} - {dayjs(sighting.dateTime).format('YYYY-MM-DD HH:mm')}
              </Text>
            </Stack>
          </Flex>
        </Card>
      ))}
    </SimpleGrid>
    <Divider my="lg" />
    <Pagination total={Math.ceil(totalItems / sightings.length)}
      value={currentPage}
      getItemProps={(page) => ({
        component: 'a',
        href: getFilteredURL(page),
      })}
    />
    <Portal>
      <Box pos="fixed" bottom={90} right={30} >
        <ActionIcon size={'xl'} component="a" href="/glutt/new" >
          <RiAddLargeLine />
        </ActionIcon>
      </Box>
    </Portal>
  </Box>
}

export default List