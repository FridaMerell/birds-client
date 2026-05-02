'use client'

import ClassIcon from "@/components/common/ClassIcon"
import useUser from "@/hooks/useUser"
import { TaxClass } from "@/interfaces/taxon/taxclass"
import { ActionIcon, CardSection, Flex, Group, Popover } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { IconDotsVertical, IconInfoCircle } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"


const IconPicker = ({ taxon }: { taxon: TaxClass }) => {
  const [icon, setIcon] = useState<string>(taxon.icon || '')
  const [open, setOpen] = useState<boolean>(false)
  
  useEffect(() => {
    if (icon && icon !== taxon.icon)
      updateIcon(icon)
  }, [icon])

  const updateIcon = async (newIcon: string) => {
    console.log(taxon)
    const response = await fetch('/api/taxon/icons', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taxclassId: taxon.scientificName,
        icon: newIcon
      }),
    })

    if (response.ok) {
      setIcon(newIcon)
      setOpen(false)
      notifications.show({
        title: 'Icon updated',
        message: 'The icon has been updated successfully',
        color: 'green'
      })
    }

  }
  return (

    <Popover opened={open} onClose={() => setOpen(false)} position="bottom" withArrow shadow="md" width={200} >
      <Popover.Target>
        <ActionIcon onClick={() => setOpen((o) => !o)}>
          <ClassIcon color="" icon={icon} size={21} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <Flex direction="column" gap={10}>
          <span>Byt ikon</span>
          <Group gap={10} wrap="wrap">
            {['bird', 'plant', 'insect', 'butterfly', 'fungi', 'flower', 'dragonfly', 'leaf'].map((iconType) => (
              <ActionIcon key={iconType} onClick={() => {
                setIcon(iconType)
                setOpen(false)
              }}>
                <ClassIcon icon={iconType} size={24} />
              </ActionIcon>
            ))}
          </Group>
        </Flex>
      </Popover.Dropdown>
    </Popover>)
}

const EditClass = ({ taxon }: { taxon: TaxClass }) => {
  const { user } = useSelector((state: any) => state.user)

  return <>
    {(user && user.id) ?
      <Group gap={5}>
        <IconPicker taxon={taxon} />
      </Group>
      : <ActionIcon >
        <ClassIcon icon={taxon.icon || ''} size={21} />
      </ActionIcon>
    }
  </>



}

export default EditClass