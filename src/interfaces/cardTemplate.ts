import { Species } from "./taxon/species"
import { TaxClass } from "./taxon/taxclass"

export type CardTemplate = {
  id?: number;
  name: string;
  category: TaxClass;
  species: Species[];
}

