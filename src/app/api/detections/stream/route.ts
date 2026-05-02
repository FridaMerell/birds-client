import { NextRequest } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const GET = async (request: NextRequest) => {
	const lastId = request.nextUrl.searchParams.get("lastId")

	const params = new URLSearchParams()
	if (lastId) params.set("lastId", lastId)

	const upstream = await fetch(`${API_URL}/api/birdnet/detections/stream?${params}`, {
		headers: {
			Accept: "text/event-stream",
			"Cache-Control": "no-cache",
		},
		// @ts-expect-error Next.js extended fetch options
		cache: "no-store",
	})

	return new Response(upstream.body, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache, no-transform",
			"X-Accel-Buffering": "no",
		},
	})
}

export const dynamic = "force-dynamic"
