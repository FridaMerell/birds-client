import { authorizedFetch, unauthorizedFetch } from "@/lib/api/helper"
import { NextRequest, NextResponse } from "next/server"

export const GET = async (request: NextRequest) => {
	let locations = await unauthorizedFetch("/locations") // Implement this function to fetch locations
	return NextResponse.json(locations.data)
}

export const POST = async (request: NextRequest) => {
	let body = await request.json()
	let requestBody = {
		name: body.name,
		point: {
			latitude: body.latitude,
			longitude: body.longitude,
		},
		radius: body.radius,
	}
	let response = await authorizedFetch.post("/locations", requestBody)
	return NextResponse.json(
		response.status === 201
			? response.data
			: { error: "Failed to create location" },
		{ status: response.status }
	)
}

export const dynamic = "force-dynamic"
