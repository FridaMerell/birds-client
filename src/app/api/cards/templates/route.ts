import { authorizedFetch } from "@/lib/api/helper"
import { NextRequest } from "next/server"

export const GET = async (request: NextRequest) => {

  let response = await authorizedFetch.get("/cards/templates", {
    validateStatus: (status) => status >= 200 && status < 500,
  })

  if (response.status === 200) {
    return new Response(JSON.stringify({ templates: response.data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
  
	return new Response(JSON.stringify({ templates: [] }), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	})
}
