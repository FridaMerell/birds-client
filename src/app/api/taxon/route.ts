import { authorizedFetch } from "@/lib/api/helper"
import { NextRequest } from "next/server"

export const GET = async (request: NextRequest) => {

  let response = await authorizedFetch.get("/tax_classes", {
    validateStatus: (status) => status >= 200 && status < 500,
  })

  if (response.status === 200) {
    return new Response(JSON.stringify({ taxonomies: response.data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
  
  return new Response(JSON.stringify({ taxons: [] }), {
    status: 500,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

export const POST = async (request: Request) => {
  const reqBody = await request.json()

  const data = {
    taxonomyId: reqBody.taxonomyId,
    scientificName: reqBody.scientificName,
    vernacularName: reqBody.vernacularName,
    icon: reqBody.icon ?? '',
  }

  try {
    const response = await authorizedFetch.post('/tax_class', data)
    return new Response(JSON.stringify(response.data), { status: 201 })
  } catch (error) {
    return new Response('Error creating taxon class', { status: 500 })
  }
}


export const DELETE = async (request: NextRequest) => {
  const taxonomyId = request.nextUrl.searchParams.get('taxonomyId')
  const taxonomy = request.nextUrl.searchParams.get('taxonomy')

  try {
    await authorizedFetch.delete(`/${taxonomy}/${taxonomyId}`)
    return new Response('Taxon class deleted successfully', { status: 200 })
  } catch (error) {
    return new Response('Error deleting taxon class', { status: 500 })
  }
}