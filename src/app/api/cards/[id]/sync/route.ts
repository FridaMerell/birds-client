import { authorizedFetch } from "@/lib/api/helper"
import { getObservationCount } from "@/lib/artdatabanken"
import { NextRequest } from "next/server"

export const PATCH = async (request: NextRequest) => {
	try {
		let toSyncData = await request.json()
		let cardId = toSyncData.cardId || null

		if (!cardId) {
			return new Response(
				JSON.stringify({ message: "Card ID is required for sync" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			)
		}
		let taxonomies = toSyncData.taxonomies || []
		let minObservationsPerYear = toSyncData.minObservations || 0

		let observationData = await getObservationCount(taxonomies)

		console.log("Observation data:", observationData)
		let toRemove: string[] = []
		observationData.records.map((item: any) => {
      if(!item.lastSighting){
        toRemove.push(item.taxonId)
        return
      }
			let firstYear = new Date('2020-01-01').getFullYear()
			let lastYear = new Date().getFullYear()
			let totalYears = lastYear - firstYear + 1
			let avgPerYear = item.observationCount / totalYears
			if (avgPerYear < minObservationsPerYear) {
				toRemove.push(item.taxonId)
			}
		})

		let response = await authorizedFetch.patch(
			process.env.NEXT_PUBLIC_API_BASE_URL + `/cards/remove-species/${cardId}`,
			{
				taxonomyIds: toRemove,
			}
		)

		return new Response(
			JSON.stringify({
				message: "removed species from card", removed: toRemove,
        cardId: cardId,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		)
	} catch (error: any) {
		console.error(
			"Error processing card data:",
			error.response ?? error.message
		)
		return new Response(JSON.stringify({ message: "Internal server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		})
	}
}
