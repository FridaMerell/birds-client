import { TaxClass } from "./taxon/taxclass"
import { User } from "./user"

export type Card = {
  id?: string;
  name?: string;
  species?: string[];
  subscribers?: User[];
  start?: any;
  ends?: any;
  sightings?: string[];
  taxonomy?: TaxClass;
  speciesByFamily?: object;
  readonly distinctSightings?: any;
  readonly owners?: any;
  readonly restricted?: boolean;
}
