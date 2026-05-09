import { authorizedFetch } from "@/lib/api/helper"
import { NextRequest, NextResponse } from "next/server"

export const GET = async (request: NextRequest) => {
	const deviceId = request.nextUrl.searchParams.get("deviceId")
	const response = await authorizedFetch.get(`/api/birdnet/species-summary?deviceId=${deviceId}`)
	return NextResponse.json(response.data)
}

export const dynamic = "force-dynamic"
