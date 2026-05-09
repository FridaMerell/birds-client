import { Species } from './taxon/species'

export interface SpeciesSummary {
	species: Species
	detectionCount: number
	latestDetection: string // ISO 8601 UTC datetime
}
