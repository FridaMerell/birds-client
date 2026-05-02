import { Species } from "./taxon/species"

export interface Sighting {
	id?: string;
	user?: string;
	species?: Species;
	place?: string;
	dateTime?: Date;
	comment?: string;
	cards?: any;
	location?: any;
	readonly restricted?: boolean;
	readonly owners?: any;
}
