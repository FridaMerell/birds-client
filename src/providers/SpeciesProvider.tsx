'use client'
import { Location } from '@/interfaces/location'
import { Species } from '@/interfaces/taxon/species'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

interface SpeciesContextValue {
  // Quick observe
  quickObserveSpecies: Species | null
  setQuickObserveSpecies: (species: Species | null) => void

  // Locations
  locations: Location[]
  fetchLocations: () => void

  // Species search
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: Species[]
  isSearching: boolean
}

const SpeciesContext = createContext<SpeciesContextValue | null>(null)

export const useSpeciesContext = () => {
  const ctx = useContext(SpeciesContext)
  if (!ctx) throw new Error('useSpeciesContext must be used inside SpeciesProvider')
  return ctx
}

interface Props {
  children: React.ReactNode
}

export const SpeciesProvider = ({ children }: Props) => {
  const [quickObserveSpecies, setQuickObserveSpecies] = useState<Species | null>(null)

  const [locations, setLocations] = useState<Location[]>([])
  const locationsFetched = useRef(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Species[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const fetchLocations = useCallback(async () => {
    if (locationsFetched.current || locations.length > 0) return
    locationsFetched.current = true
    try {
      const res = await fetch('/api/locations')
      const data = await res.json()
      setLocations(data)
    } catch {
      locationsFetched.current = false
    }
  }, [locations.length])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const controller = new AbortController()
    let active = true

    const run = async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/search/species?q=${encodeURIComponent(searchQuery.trim())}`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error('Search failed')
        const data: Species[] = await res.json()
        if (active) setSearchResults(data)
      } catch (err: any) {
        if (err.name !== 'AbortError' && active) setSearchResults([])
      } finally {
        if (active) setIsSearching(false)
      }
    }

    const debounce = setTimeout(run, 300)

    return () => {
      active = false
      clearTimeout(debounce)
      controller.abort()
    }
  }, [searchQuery])

  return (
    <SpeciesContext.Provider
      value={{
        quickObserveSpecies,
        setQuickObserveSpecies,
        locations,
        fetchLocations,
        searchQuery,
        setSearchQuery,
        searchResults,
        isSearching,
      }}
    >
      {children}
    </SpeciesContext.Provider>
  )
}
