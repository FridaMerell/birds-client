import { authorizedFetch } from "@/lib/api/helper"
import { NextRequest, NextResponse } from "next/server"

export const GET = async (_request: NextRequest) => {
	const response = await authorizedFetch.get("/api/device")
	return NextResponse.json(response.data)
}

export const dynamic = "force-dynamic"
