export interface Location {
  id?: string;
  Name?: string;
  point?: any;
  radius?: number;
  sightings?: string[];
  name?: string;
  readonly longitude?: number;
  readonly latitude?: number;
  totalSightings?: number;
}
