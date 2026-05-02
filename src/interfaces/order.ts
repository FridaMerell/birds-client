export interface Order {
  id?: string;
  taxonomyId?: number;
  scientificName?: string;
  vernacularName?: string;
  class?: string;
  families?: string[];
}
