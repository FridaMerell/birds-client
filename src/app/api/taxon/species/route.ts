import { authorizedFetch, unauthorizedFetch } from "@/lib/api/helper"
import { getToken } from "@/lib/auth"
import { NextRequest } from "next/server"

export const POST = async (request: Request) => {
	const reqBody = await request.json()

	const species = {
		taxonomyId: reqBody.taxonomyId,
		scientificName: reqBody.scientificName,
		vernacularName: reqBody.vernacularName,
		swedishProminence: reqBody.swedishProminence ?? "",
		taxClass: reqBody.taxClassId ? "/tax_class/" + reqBody.taxClassId : null,
	}
	try {
		const response = await authorizedFetch.post("/species", species)
		return new Response(JSON.stringify(response.data), { status: 201 })
	} catch (error) {
		return new Response("Error creating species", { status: 500 })
	}
}

export const GET = async (request: NextRequest) => {
	const taxonomy = request.nextUrl.searchParams.get("taxonomy")

	const scientificName = request.nextUrl.searchParams.get("scientificName")
	const page = request.nextUrl.searchParams.get("page") || "1"

	try {
		let hasToken = false
		if (await getToken()) {
			hasToken = true
		}
		let url = `/species?page=${page}&taxonomy=${taxonomy}`
		if (scientificName) {
			url += `&scientificName=${scientificName}`
		}
		let response = null

		if (hasToken) {
			try {
				response = await authorizedFetch.get(url, {
					headers: {
						Accept: "application/vnd.api+json",
					},
				})
				return new Response(JSON.stringify(response.data), { status: 200 })
			} catch (error) {
				response = await unauthorizedFetch.get(url, {
					headers: {
						Accept: "application/vnd.api+json",
					},
				})
				return new Response(JSON.stringify(response.data), { status: 200 })
			}
		} else {
			response = await unauthorizedFetch.get(url, {
				headers: {
					Accept: "application/vnd.api+json",
				},
			})
			return new Response(JSON.stringify(response.data), { status: 200 })
		}
	} catch (error: any) {
		if (error?.status && error?.status === 401) {
			return new Response("Unauthorized", { status: 401 })
		}
		return new Response("Error fetching species", { status: 500 })
	}
}
