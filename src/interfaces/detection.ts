import { Device } from './device'
import { Species } from './taxon/species'

export interface Detection {
	id: number
	species: Species
	confidence: number
	detectedAt: string
	device: Device
}
