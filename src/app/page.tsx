import Image from "next/image"
import useUser from '@/hooks/useUser'
import NearbySightings from "@/components/cards/NearbySightings"
import Subscribed from "@/components/cards/Subscribed"
import { SimpleGrid } from "@mantine/core"



export default function Home() {
  return (<SimpleGrid cols={{ base: 1, md: 2 , lg:3 }} spacing="lg" p={20}>
     <NearbySightings />
    <Subscribed /> 
  </SimpleGrid>
  )
}
