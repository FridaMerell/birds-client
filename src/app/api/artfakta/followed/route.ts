import { authorizedFetch } from "@/lib/api/helper"
import { getNearbySightings } from "@/lib/artdatabanken"
import { NextRequest } from "next/server"

export const GET = async (request: NextRequest) => {
	let data = {} as { latitude?: number; longitude?: number }
  // read from url query parameters
  const url = new URL(request.url)
  const latitude = url.searchParams.get("latitude")
  const longitude = url.searchParams.get("longitude")
  const page = url.searchParams.get("page") || "0"
  if (latitude && longitude) {
    data.latitude = parseFloat(latitude)
    data.longitude = parseFloat(longitude)
  }
	let subscribedIds = (
		await authorizedFetch("/subscribed-species", { method: "GET" })
	).data as string[]

	let nearbySightings = null
   
	if (data.latitude && data.longitude)
		nearbySightings = await getNearbySightings(
			data.latitude,
			data.longitude,
			subscribedIds, 
      parseInt(page)
		)
	else
		nearbySightings = await getNearbySightings(
			undefined,
			undefined,
			subscribedIds, 
      parseInt(page)
		)

	return new Response(JSON.stringify(nearbySightings), {
		headers: {
			"Content-Type": "application/json",
		},
	})
}
