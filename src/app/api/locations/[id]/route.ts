import { Location } from "@/interfaces/location"
import { authorizedFetch } from "@/lib/api/helper"
import { NextRequest, NextResponse } from "next/server"

export const GET = async (
	request: NextRequest,
	{ params }: { params: { id: string } }
) => {
	let id = (await params).id
	return new Response("Location ID route")
}

export const PATCH = async (
	request: NextRequest,
	{ params }: { params: { id: string } }
) => {
	let id = (await params).id
	let requestBody = (await request.json()) as Location

	let response = await authorizedFetch.patch(`/locations/${id}`, {
		name: requestBody.name,
		point: {
			longitude: requestBody.longitude,
			latitude: requestBody.latitude,
		},
		radius: requestBody.radius,
	})
	return NextResponse.json(response.data, { status: response.status })
}

export const DELETE = async (
	request: NextRequest,
	{ params }: { params: { id: string } }
) => {
	let id = (await params).id
	let response = await authorizedFetch.delete(`/locations/${id}`)
	return new NextResponse(null, { status: response.status })
}

export const dynamic = "force-dynamic"
