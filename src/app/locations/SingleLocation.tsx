'use client'
import { Location } from "@/interfaces/location"
import { deleteLocation } from "@/lib/features/appSlice"
import { AppDispatch } from "@/lib/store"
import { ActionIcon, Anchor, Card, Flex, Indicator, Title } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useDispatch, useSelector } from "react-redux"

const SingleLocation = ({ location }: { location: Location }) => {
  const user = useSelector((state: any) => state.user.user)
  const dispatch = useDispatch<AppDispatch>()
  const removeLocation = async () => {
    if (!user?.id) return

    await dispatch(await deleteLocation(location.id?.toString() || "")).unwrap().then(() => {
      notifications.show({
        title: "Plats borttagen",
        message: `Platsen ${location.name} har tagits bort.`,
        color: "green",
      })
    }).catch((error) => {
      notifications.show({
        title: "Kunde inte ta bort plats",
        message: `Ett fel uppstod när platsen ${location.name} skulle tas bort.`,
        color: "red",
      })
    })
  }

  return (<Indicator label={location.totalSightings} size={16} color="gray.8" key={location.id}>
    <Card>
      <Flex justify={'space-between'}>
        <Anchor c={'currentColor'} href={`/locations/${location.id}`}>
          <Title order={4} tt={'capitalize'}>
            {location.name}
          </Title>
        </Anchor>

        {user?.id && (
          <ActionIcon onClick={removeLocation} size="lg" variant="light">
            &#10005;
          </ActionIcon>
        )}
      </Flex>

    </Card>
  </Indicator>
  )
}

export default SingleLocation