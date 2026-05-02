'use client'

import { Species } from "@/interfaces/taxon/species"
import { MultiSelect, Select, TextInput } from "@mantine/core"
import { useDebouncedCallback } from "@mantine/hooks"
import { IconLoader2 } from "@tabler/icons-react"
import { useEffect, useState } from "react"

const FindSpecies = ({ callback }: { callback: (species?: Array<Species>) => void }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [species, setSpecies] = useState<any>([])
  const [searchResults, setSearchResults] = useState<any>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    callback(species)
  }, [species])

  const handleSearch = useDebouncedCallback(async (value: string) => {
    setLoading(true)
    let result = await fetch('/api/search/species?q=' + encodeURIComponent(value))
    let data = await result.json()
    let results = [
      ...species,
      ...data]
      //remove duplicates
      .filter((s: any, index: number, self: any[]) =>
        index === self.findIndex((t: any) => (
          t.id === s.id
        ))
      )
    setSearchResults(results)
    setLoading(false)
  }, 300)

  const handleType = (value: string) => {
    if (value) {
      setSearchTerm(value)
      handleSearch(value)
    }
  }

  return <MultiSelect searchable placeholder="Sök art..."
    label="Lägg till art"
    searchValue={searchTerm}
    onSearchChange={handleType}
    data={searchResults.map((s: any) => ({ value: s.id.toString(), label: s.vernacularName }))}
    value={species.map((s: any) => s.id.toString())}
    onChange={(values) => {
      let selectedSpecies = searchResults.filter((s: any) => values.includes(s.id.toString()))
      setSpecies(selectedSpecies)
    }}
    rightSection={loading ? <IconLoader2 /> : null}

  />
}

export default FindSpecies