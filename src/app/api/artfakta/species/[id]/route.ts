import { getSpecies } from "@/lib/artdatabanken"
import { NextRequest } from "next/server"

export const GET = async (
	request: NextRequest,
	{ params }: { params: { id: string } }
) => {
	const { id } = params

  let speciesData  = await getSpecies(id)

  return new Response(JSON.stringify(speciesData), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  })
}
