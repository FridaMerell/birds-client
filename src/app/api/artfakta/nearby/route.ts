import { TaxClass } from "@/interfaces/taxon/taxclass"
import { getTaxonList } from "@/lib/api/taxon"
import { getNearbySightings, getOccurances } from "@/lib/artdatabanken"
import { getTaxonomicLevel } from "@/utils/taxons"
import { NextRequest, NextResponse } from "next/server"

export const POST = async (request: NextRequest) => {
	let data = (await request.json()) as {
		latitude: number
		longitude: number
		page?: number,
		radius?: number
	}
	let taxonomies = (await getTaxonList(0)).map(
		(taxon: TaxClass) => taxon.taxonomyId
	)
	let sightings = await getNearbySightings(
		data.latitude,
		data.longitude,
		taxonomies,
		data.page ?? 0,
		data.radius ?? 5000
	)

	return new NextResponse(JSON.stringify(sightings), {
		headers: {
			"Content-Type": "application/json",
		},
	})
}
