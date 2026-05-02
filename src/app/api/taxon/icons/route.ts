import { authorizedFetch } from "@/lib/api/helper"
import { NextRequest } from "next/server"

export const PATCH = async (request: NextRequest) => {
	const { icon, taxclassId } = await request.json()

  if(!icon || !taxclassId){
    return new Response(JSON.stringify({error: 'icon and taxclassId are required'}), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
	let result = await authorizedFetch.patch(
		`/tax_class/${taxclassId}`,
		{
			icon: icon,
		},
		{
			headers: {
				Accept: "application/json",
			},
		}
	)

	return new Response(JSON.stringify(result.data), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	})
}
