import { authorizedFetch } from "@/lib/api/helper"
import { NextRequest } from "next/server"

export const POST = async (request: NextRequest) => {
  try{

    let cardData = await request.json()
    // Process cardData as needed, e.g., save to database
    console.log("Received card data:", cardData)
    
    
    let requestbody = {
      name: cardData.name,
      start: cardData.start || null,
      ends: cardData.ends || null,
      subscribers: cardData.subscribers || [],
      taxonomy: cardData.taxonomy.id || null,
      swedishProminence: cardData.swedishProminence || [],
    }
    
    let url = process.env.NEXT_PUBLIC_API_BASE_URL + "/card/from-filters"
    const response = await authorizedFetch.post(url, requestbody)
    
    if (!response || response.status !== 201) {
      return new Response(JSON.stringify({ message: "Failed to create card" }), {
        status: response ? response.status : 500,
        headers: { "Content-Type": "application/json" },
      })
    }
    
    return new Response(JSON.stringify({ message: "Card data received", card: response.data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
  })
    } catch (error:any) {
      console.error("Error processing card data:", error.response ?? error.message)
      return new Response(JSON.stringify({ message: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }
}