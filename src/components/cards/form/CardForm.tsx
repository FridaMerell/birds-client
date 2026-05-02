'use client'
import { Card } from "@/interfaces/card"
import { Grid, SimpleGrid, Stack } from "@mantine/core"
import { useLayoutEffect, useState } from "react"
import CardInfo from "./CardInfo"
import SpeciesExplorer from "./SpeciesExplorer"

const CardForm = ({ initialCard }: { initialCard?: Card }) => {
  const [card, setCard] = useState<Card>(initialCard || {
    id: '',
    name: '',
    species: [],
  })
  const [templates, setTemplates] = useState<any[]>([])
  const [templateFile, setTemplateFile] = useState<File | null>(null)

  useLayoutEffect(() => {
    // Fetch templates from the server
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/cards/templates')
        if (response.ok) {
          const data = await response.json()
          setTemplates(data.templates ?? [])
        } else {
          console.error('Failed to fetch templates')
        }
      } catch (error) {
        console.error('Error fetching templates:', error)
      }
    }

    fetchTemplates()
  }, [])

  return <Stack>
    {
      templates.length === 0 ? (
        <div>No templates available.</div>
      ) : (
        <div>
          {/* Render template selection UI here */}
          <h3>Available Templates:</h3>
          <ul>
            {templates.map((template, index) => (
              <li key={index}>{template.name}</li>
            ))}
          </ul>
        </div>
      )
    }
    <Grid gutter="lg">
      <Grid.Col span={{sm:12, md: 6, lg: 4}}>
      <CardInfo card={card} callback={setCard} />
      </Grid.Col>
      <Grid.Col span={{sm:12, md: 6, lg: 8}}>
      <SpeciesExplorer card={card} editable onChange={setCard}/>
      </Grid.Col>
    </Grid>
  </Stack>
}

export default CardForm