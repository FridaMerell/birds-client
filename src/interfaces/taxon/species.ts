export interface Species {
  id?: number;
  taxonomyId?: number|null;
  scientificName?: string;
  vernacularName?: string;
  genus?: any;
  sightings?: string[];
  cards?: any;
  swedishProminence?: string;
  taxClassId?: number|string;
  isSubscribed?: boolean;
  readonly Family?: any;
  readonly fullName?: string;
  readonly family?: any;
}
