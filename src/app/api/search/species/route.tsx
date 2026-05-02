import { unauthorizedFetch } from "@/lib/api/helper"
import { request } from "http"
import { NextRequest } from "next/server"

export const GET = async (request: NextRequest) => {
  let searchTerm = request.nextUrl.searchParams.get("q") || ""

  let response = await unauthorizedFetch(`/species?vernacularName=${encodeURIComponent(searchTerm)}`, {
    headers: {
      'Accept': 'application/json'
    }
  })

  return new Response(JSON.stringify(response.data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  })

}