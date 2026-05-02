import { authorizedFetch, refreshAuthToken } from "@/lib/api/helper"
import axios from "axios"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export const GET = async (request: NextRequest) => {
	await refreshAuthToken()
	const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL
	let endpoint = API_URL + "/user/me"
	let headerList = await headers()
	const response = await authorizedFetch.get(endpoint)

	let status = response.status
	let body = JSON.stringify(response.data)
	return new NextResponse(body, {
		status: status,
		headers: { "Content-Type": "application/json" },
	})
}

export const dynamic = "force-dynamic"
