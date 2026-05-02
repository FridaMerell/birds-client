export interface TaxClass {
  id?: number;
  taxonomyId?: number;
  vernacularName?: string;
  scientificName?: string;
  icon?: string;
  unSortedSpecies?: any[];
  species?: any[];
  unsortedSpeciesCount?: number;
  speciesCount?: number;
}
