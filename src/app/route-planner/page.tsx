'use client'
import { APIProvider } from "@vis.gl/react-google-maps"
import RoutePlanner from "./RoutePlanner"
import { Box } from "@mantine/core"

const Page = () => {
  return (
    <Box p="20px" style={{ height: '100dvh' }}>
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} libraries={['places', 'geocoding']}>

        <RoutePlanner />
      </APIProvider>
    </Box>
  )
}

export default Page