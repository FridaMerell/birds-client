import { authorizedFetch } from "@/lib/api/helper"

export const POST = async (request: Request) => {
  const { species } = await request.json()

  let response = await authorizedFetch(`/species/${species}/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  let data = await response.data
  // Placeholder for handling subscription logic
  return new Response(JSON.stringify({ success: true }), { status: 200 })
}