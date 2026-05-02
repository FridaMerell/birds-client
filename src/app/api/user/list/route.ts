import { authorizedFetch } from "@/lib/api/helper"

export const GET = async (request: Request) => {
  let response = await authorizedFetch.get("/user")

  if (response.status === 200) {
    return new Response(JSON.stringify({ users: response.data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }

  return new Response(JSON.stringify({ users: [] }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  })
}