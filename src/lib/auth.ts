'use server'
import { cookies } from 'next/headers'

export const setToken = async (token: string) => {
    

    (await cookies()).set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 1 day in seconds
    })
}

export const getToken =async () => {
    
    return (await cookies()).get('token')?.value || null
}

export const setRefreshToken = async(token: string) => {
    
    (await cookies()).set('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days in seconds
    })
}

export const getRefreshToken = async() => {
    return (await cookies()).get('refreshToken')?.value || null
}

export const removeTokens =async () => {
    let cookieStore = await cookies()
    cookieStore.delete('token')
    cookieStore.delete('refreshToken')
}