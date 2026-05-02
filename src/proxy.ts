import { NextResponse, type NextRequest } from "next/server"
import { cookies } from "next/headers"
import { getUser } from "./lib/api/user"
import { authorizedFetch } from "./lib/api/helper"
import axios from "axios"

export async function proxy(request: NextRequest) {
	let cookieStore = await cookies()
	const token = cookieStore.get("token")

	const redirectToLogin = () => {
		// redirect to login with parameter for redirecting back after login
		const redirectUrl = new URL("/login", request.url)
		redirectUrl.searchParams.set("redirect", request.nextUrl.pathname)
		const res = NextResponse.redirect(redirectUrl)
		res.cookies.delete("token")
		res.cookies.delete("refreshToken")
		return res
	}


	if (token) {
		const user = await axios
			.get(authorizedFetch.defaults.baseURL + "/user/me", {
				headers: {
					Authorization: `Bearer ${token.value}`,
				},
				validateStatus: status => status >= 200 && status < 500,
			})
			.then(res => res.data)
			.catch(err => {
				console.log("Error fetching user in middleware:", err)
				return null
			})

			// console.log("User fetched in middleware:", token.value, user)
			
		if (!user || user.code === 401) {
			return redirectToLogin()
		} else {
			if (request.nextUrl.pathname === "/login") {
				console.log("Redirecting to / from /login because already logged in")
				// remove tokens and redirect to login
				const res = NextResponse.redirect(new URL("/", request.url))
				return res
			}
		}
	} else if (request.nextUrl.pathname !== "/login") {
		return redirectToLogin()
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		"/glutt/:path*",
		"/observations/:path*",
		"/locations/:path*",
		"/login",
		"/card/new",
	],
}
