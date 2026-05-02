import { NextResponse } from 'next/server'
import { refreshAuthToken } from '@/lib/api/helper'

export const POST = async () => {
  try {
    await refreshAuthToken()
    return NextResponse.json({ ok: true }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'Failed to refresh token' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  }
}

export const dynamic = 'force-dynamic'
