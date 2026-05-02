import axios from "axios"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export const GET = async (request: NextRequest) => {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  let endpoint = API_URL + '/user/me'
  let headerList = await headers()
  let requestToken = headerList.get('Authorization')?.replace('Bearer ', '') || ''
  const response = await axios.get(endpoint, {
    headers: {
      'Authorization': `Bearer ${requestToken}`
    },
    validateStatus: (status) => {
      return true
    }
  })

  let status = response.status
  let body = JSON.stringify(response.data)
  return new NextResponse(body, {status: status, headers: {'Content-Type': 'application/json'}})
}

export const dynamic = 'force-dynamic'