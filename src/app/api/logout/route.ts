import { removeTokens } from '@/lib/auth'
export const POST = async () => {
    'use server'

    await removeTokens()

    return new Response(null, {
        status: 200,
    })
}