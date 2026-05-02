import { authorizedFetch } from "@/lib/api/helper"
import { NextRequest } from "next/server"

export const POST = async (request: NextRequest) => {
	let data = (await request.json()) as {
		speciesId: number
		locationId: number | null
		timestamp?: string,
    dateTime?: string,
    comment?: string|null,
    description?: string|null

	}

  let response = await authorizedFetch("sighting", {
    method: "POST",
    data: JSON.stringify({
      species: 'species/' + data.speciesId,
      location: data.locationId ? 'locations/' + data.locationId : null,
      dateTime: data.dateTime ??  data.timestamp,
      comment: data.comment ?? data.description ?? null,
    }),
  })

  console.log("POST /observations response:", response)

  return response.status === 201
    ? new Response(null, { status: 201 })
    : new Response(null, { status: response.status })
}
