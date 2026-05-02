'use client'
import { SimpleGrid } from "@mantine/core"
import SingleLocation from "./SingleLocation"
import { Location } from "@/interfaces/location"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setLocations } from "@/lib/features/appSlice"
import { useDocumentTitle } from "@mantine/hooks"

const List = ({ initialLocations }: { initialLocations: Location[] }) => {
  useDocumentTitle("Platser - Börds")
  const dispatch = useDispatch()
  const locations = useSelector((state: any) => state.app.locations)
  useEffect(() => {
    dispatch(setLocations(initialLocations))
  }, [])

  return (<SimpleGrid cols={{
    sm: 2,
    md: 3,
    lg: 4,
    xl: 6
  }} spacing={20}>
    {locations.map((location: Location) => (
      <SingleLocation key={location.id} location={location} />
    ))}
  </SimpleGrid>)
}

export default List