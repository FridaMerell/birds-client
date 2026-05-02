import { getSpecies } from "@/lib/artdatabanken"
import { NextRequest } from "next/server"

export const GET = async (
	request: NextRequest,
	{ params }: { params: { id: string } }
) => {
	// species/[id] in URL
	let id = (await params).id
	if (!id) {
		return new Response("ID paramlet id eter is required", { status: 400 })
	}
	let species = await getSpecies(id)
	if (!species || species.length === 0) {
		return new Response("Species not found", { status: 404 })
	}
  return new Response(JSON.stringify(species[0]), {
    headers: {
      "Content-Type": "application/json",
    },
  })
}
