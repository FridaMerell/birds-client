import { NextRequest } from "next/server"

export const GET = async (request: NextRequest, params : { name: string }) => {
  const scientificName = (await params).name  
}