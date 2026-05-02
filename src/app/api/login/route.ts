import axios from 'axios'
import {NextRequest, NextResponse} from 'next/server.js'

export const dynamic = 'force-static'
export const POST = async (request: NextRequest) => {
	const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL
	const data = await request.json()
	let endpoint = API_URL + '/login'
	const response = await axios.post(endpoint, {
		email: data.email,
		password: data.password,


	}, {
		validateStatus: (status) => {
			return true
		}
	})

	let status = response.status
	let body = JSON.stringify(response.data)
	if (status === 401) {
		return new NextResponse(body, {status: 401, headers: {'Content-Type': 'application/json'}})
	}
	if (status !== 200) {
		return new NextResponse( body, {status: status, headers: {'Content-Type': 'application/json'}})
	}

	let token = response.data.token
	let refreshtoken = response.data.refresh_token

	const response_with_cookie = new NextResponse(body, {status: 200, headers: {'Content-Type': 'application/json'}})

	response_with_cookie.cookies.set('token', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: 60 * 60 * 24
	})

	response_with_cookie.cookies.set('refreshToken', refreshtoken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: 60 * 60 * 24 * 7
	})

	return response_with_cookie
}