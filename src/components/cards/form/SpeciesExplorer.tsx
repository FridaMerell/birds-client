import ClassIcon from "@/components/common/ClassIcon"
import { Card as CardType } from "@/interfaces/card"
import { CardTemplate } from "@/interfaces/cardTemplate"
import { TaxClass } from "@/interfaces/taxon/taxclass"
import { Box, Button, Card, Chip, Flex, Group, LoadingOverlay, MultiSelect, Pill, Radio, RadioIndicator, ScrollArea, Select, Stack, Stepper, Text, TextInput, ThemeIcon, Title } from "@mantine/core"
import { useEffect, useState } from "react"
import classes from './speciesexplorer.module.css'

type SpeciesFilter = {
  swedishProminence: string[]
  redlistCategory: string[]
  minObservationsPerYear: number | null
}

const SpeciesStep = ({ filters, onChange }: { filters: SpeciesFilter, onChange: (filters: SpeciesFilter) => void }) => {
  const toggleSwedishProminence = (value: string, checked: boolean) => {
    let newValues = [...filters.swedishProminence]
    if (checked) {
      newValues.push(value)
    } else {
      newValues = newValues.filter(v => v !== value)
    }
    onChange({ ...filters, swedishProminence: newValues })
  }
  return <>
    <Title order={4}>Artfilter</Title>
    <Stack>
      <TextInput label="Minsta antal observationer per år" type="number" value={filters.minObservationsPerYear?.toString() || ''} onChange={(e) => {
        const value = e.currentTarget.value ? parseInt(e.currentTarget.value) : null
        onChange({ ...filters, minObservationsPerYear: value })
      }} />
      <Group wrap="wrap" gap={5} my={20}>
        <Chip checked={filters.swedishProminence.includes('common')} onChange={() => {
          toggleSwedishProminence('common', !filters.swedishProminence.includes('common'))
        }}>Bofast och reproducerande</Chip>
        <Chip checked={filters.swedishProminence.includes('regular')} onChange={() => {
          toggleSwedishProminence('regular', !filters.swedishProminence.includes('regular'))
        }}>Regelbunden förekomst, ej reproducerande</Chip>
        <Chip checked={filters.swedishProminence.includes('temporary')} onChange={() => {
          toggleSwedishProminence('temporary', !filters.swedishProminence.includes('temporary'))
        }}>Ej bofast men tillfälligt reproducerande</Chip>
        <Chip checked={filters.swedishProminence.includes('occasional')} onChange={() => {
          toggleSwedishProminence('occasional', !filters.swedishProminence.includes('occasional'))
        }}>Tillfällig förekomst (alt. kvarstående)</Chip>
        <Chip checked={filters.swedishProminence.includes('former')} onChange={() => {
          toggleSwedishProminence('former', !filters.swedishProminence.includes('former'))
        }}>Ej längre bofast, nu endast tillfälligt förekommande</Chip>
        <Chip checked={filters.swedishProminence.includes('uncertain')} onChange={() => {
          toggleSwedishProminence('uncertain', !filters.swedishProminence.includes('uncertain'))
        }}>Osäkert om påträffad</Chip>
        <Chip checked={filters.swedishProminence.includes('notfound')} onChange={() => {
          toggleSwedishProminence('notfound', !filters.swedishProminence.includes('notfound'))
        }}>Ej påträffad</Chip>
      </Group>
      <MultiSelect

        label="Rödlistningskategori" placeholder="Välj rödlistningskategori" multiple
        data={[
          { value: 'LC', label: 'LC - Livskraftig' },
          { value: 'NT', label: 'NT - Nära hotad' },
          { value: 'VU', label: 'VU - Sårbar' },
          { value: 'EN', label: 'EN - Starkt hotad' },
          { value: 'CR', label: 'CR - Akut hotad' },
          { value: 'RE', label: 'RE - Regionutdöd' },
          { value: 'DD', label: 'DD - Otillräcklig kunskap' },
        ]}
        value={filters.redlistCategory}
        onChange={(values) => {
          onChange({ ...filters, redlistCategory: values })
        }}
      />
    </Stack>
  </>
}

const SpeciesExplorer = ({ card, editable, onChange }: { card: CardType, editable?: boolean, onChange?: (card: CardType) => void }) => {
  const [taxonomies, setTaxonomies] = useState<TaxClass[]>([])
  const [templates, setTemplates] = useState<CardTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate | null>(null)
  const [activeStep, setActiveStep] = useState<number>(0)
  const [filters, setFilters] = useState<SpeciesFilter>({
    swedishProminence: [],
    redlistCategory: [],
    minObservationsPerYear: null
  })
  const [currentState, setCurrentState] = useState<string>('')
  const [creationLogs, setCreationLogs] = useState<string[]>([])

  useEffect(() => {
    // Fetch taxonomies from the server
    const fetchTaxonomies = async () => {
      try {
        const response = await fetch('/api/taxon')
        if (response.ok) {
          const data = await response.json()
          setTaxonomies(data.taxonomies ?? [])
        } else {
          console.error('Failed to fetch taxonomies')
        }
      } catch (error) {
        console.error('Error fetching taxonomies:', error)
      }
    }

    fetchTaxonomies()
  }, [])

  const loadFromTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/cards/templates/${templateId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedTemplate(data.template)
        if (onChange) {
          onChange({ ...card, species: data.template.species.map((s: any) => s.id?.toString() ?? '') })
        }
      } else {
        console.error('Failed to fetch template')
      }
    } catch (error) {
      console.error('Error fetching template:', error)
    }
  }

  const allFieldsFilled = () => {
    if (!card.taxonomy) return false
    if (!card.name) return false
    return true
  }

  const createCard = async () => {
    if (!allFieldsFilled()) return

    let result = await fetch('/api/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: card.name,
        start: card.start || null,
        ends: card.ends || null,
        subscribers: card.subscribers || [],
        taxonomy: card.taxonomy || null,
        swedishProminence: filters.swedishProminence,
        redlistCategory: filters.redlistCategory,
        minObservationsPerYear: filters.minObservationsPerYear,
      }),
    })

    if (result.ok) {
      const data = await result.json()
      console.log("Card created successfully:", data)
      onChange && onChange(data.card)
      setCurrentState('Krysskort skapat med ID: ' + data.card.id)
      setCreationLogs(prevLogs => [...prevLogs, 'Krysskort skapat med ID: ' + data.card.id])
      await runFilterSync(data.card.id, data.card.species || [])
    } else {
      setCurrentState('Misslyckades med att skapa krysskort.')
    }
  }

  const runFilterSync = async (cardId: number, speciesIds: any[]) => {
    setCurrentState('Kör filter...')
    setCreationLogs(prevLogs => [...prevLogs, 'Kör filter...'])
    // batches of 20 species
    for (let i = 0; i < speciesIds.length; i += 20) {
      const batch = speciesIds.slice(i, i + 20)
      setCurrentState(`Synkroniserar arter ${i + 1} - ${Math.min(i + 20, speciesIds.length)} av ${speciesIds.length}...`)
      setCreationLogs(prevLogs => [...prevLogs, `Synkroniserar arter ${i + 1} - ${Math.min(i + 20, speciesIds.length)} av ${speciesIds.length}...`])
      let result = await fetch('/api/cards/' + card.id + '/sync', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId: cardId,
          taxonomies: batch.map(species => parseInt(species.taxonomyId)),
          minObservations: filters.minObservationsPerYear || 0,
        }),
      })

      if (result.ok) {
        setCurrentState(`Synkroniserade arter ${i + 1} - ${Math.min(i + 20, speciesIds.length)} av ${speciesIds.length}.`)
        setCreationLogs(prevLogs => [...prevLogs, `Synkroniserade arter ${i + 1} - ${Math.min(i + 20, speciesIds.length)} av ${speciesIds.length}.`])
      } else {
        setCurrentState(`Misslyckades med att synkronisera arter ${i + 1} - ${Math.min(i + 20, speciesIds.length)}.`)
        setCreationLogs(prevLogs => [...prevLogs, `Misslyckades med att synkronisera arter ${i + 1} - ${Math.min(i + 20, speciesIds.length)}.`])
      }
    }
    setCurrentState('Färdig med filter.')
    setCreationLogs(prevLogs => [...prevLogs, 'Färdig med filter.'])
  }

  return (
    <Card p={40} withBorder>
      <Stack>
        <Stepper active={activeStep} onStepClick={setActiveStep} orientation="horizontal" allowNextStepsSelect={false} >
          <Stepper.Step label="Mall" description="Välj mall för artlista" />
          <Stepper.Step label="Taxnomi" description="Välj taxonomi" />
          <Stepper.Step label="Artlista" description="Hantera artfilter" />
          <Stepper.Step label="Skapa krysskort" description="Applicera filter och skapa krysskort" />
          <Stepper.Completed >
            <Title order={4}>Färdig!</Title>
            <Text>Du har nu skapat din artlista.</Text>
          </  Stepper.Completed>
        </Stepper>
        <Stack my={30}>

          {activeStep === 0 && (
            <>
              <Select label="Välj mall för artlista" placeholder="Välj mall"
                data={templates.map(t => ({ value: t.id?.toString() ?? '', label: t.name }))}
                value={undefined}
                onChange={(value) => {
                  const selected = templates.find(t => t.id?.toString() === value)
                  if (selected && onChange) {
                    onChange({ ...card, species: selected.species.map(s => s.id?.toString() ?? '') })
                  }
                }}
              />

              <Group justify="space-between" mt={20}>
                <Button disabled onClick={() => setActiveStep(activeStep - 1)}>Tillbaka</Button>
                <Button onClick={() => setActiveStep(activeStep + 1)}>{selectedTemplate ? 'Nästa' : 'Skippa'}</Button>
              </Group>
            </>
          )

          }

          {activeStep === 1 && (
            <>
              <Title order={4}>Välj taxonomi</Title>
              <Radio.Group value={card.taxonomy?.id?.toString() ?? undefined} onChange={(value) => {
                const selectedTaxonomy = taxonomies.find(t => t.id?.toString() === value)
                if (selectedTaxonomy && onChange) {
                  onChange({ ...card, taxonomy: selectedTaxonomy })
                }
              }}>
                <Group gap={15} mt={10}>
                  {taxonomies.map(taxon => (
                    <Radio.Card withBorder className={classes.root} w={350} key={taxon.id} value={taxon.id?.toString() ?? ''} p={20}>
                      <Group>
                        {
                          taxon.icon ? <ThemeIcon size={'lg'} ><ClassIcon icon={taxon.icon} /></ThemeIcon> : <Radio.Indicator />

                        }
                        <div>
                          <Text size="lg" tt={'capitalize'}>{taxon.vernacularName}</Text>
                          <Text size="xs" c="gray">{taxon.scientificName}</Text>
                        </div>
                      </Group>
                    </Radio.Card>
                  ))}
                </Group>
              </Radio.Group>
              <Group justify="space-between" mt={20}>
                <Button onClick={() => setActiveStep(activeStep - 1)}>Tillbaka</Button>
                <Button disabled={!card.taxonomy} onClick={() => setActiveStep(activeStep + 1)}>Nästa</Button>
              </Group>
            </>
          )}

          {activeStep === 2 && (
            <>
              <SpeciesStep filters={filters} onChange={setFilters} />
              <Group justify="space-between" mt={20}>
                <Button onClick={() => setActiveStep(activeStep - 1)}>Tillbaka</Button>
                <Button onClick={() => setActiveStep(activeStep + 1)}>Nästa</Button>
              </Group>
            </>
          )}


          {
            activeStep === 3 && (<>
              {!allFieldsFilled() ? <Text c="red">Fyll i all nödvändig information i kortets grundläggande information för att kunna skapa krysskort.</Text>
                : <>

                  <Text>All nödvändig information är ifylld. Klicka på skapa krysskort för att generera artlistan.</Text>
                  <ScrollArea h={creationLogs.length > 0 ? 300 : 0}>
                    {creationLogs.map((log, index) => (
                      <Text key={index} fz="sm">{log}</Text>
                    ))}
                  </ScrollArea>
                  <div>
                    <Button mt={20} onClick={createCard}>Skapa krysskort</Button>
                  </div>
                </>
              }
            </>
            )
          }
        </Stack>

      </Stack>
    </Card>
  )
}

export default SpeciesExplorer