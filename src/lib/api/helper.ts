"use server"
import axios from "axios"
import { getRefreshToken, getToken, removeTokens, setToken } from "@/lib/auth"

//import API_URL from .env
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const authorizedFetch = axios.create({
	baseURL: API_URL,
	withCredentials: true,
})

//inject token into request headers
authorizedFetch.interceptors.request.use(async config => {

	const token = await getToken()
	if (token) {
		config.headers["Authorization"] = `Bearer ${token}`

	}
	
	return config
})

//set content types
authorizedFetch.defaults.headers.post["Content-Type"] = "application/json"
authorizedFetch.defaults.headers.put["Content-Type"] = "application/json"
authorizedFetch.defaults.headers.patch["Content-Type"] =
	"application/merge-patch+json"
authorizedFetch.defaults.headers.delete["Content-Type"] = "application/json"

//set accept types
authorizedFetch.defaults.headers.get["Accept"] = "application/json"
authorizedFetch.defaults.headers.post["Accept"] = "application/json"
authorizedFetch.defaults.headers.put["Accept"] = "application/json"
authorizedFetch.defaults.headers.patch["Accept"] = "application/json"
authorizedFetch.defaults.headers.delete["Accept"] = "application/json"

authorizedFetch.interceptors.response.use(
	response => {
		return response
	},
	async error => {
		const originalRequest = error.config
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true

			try {
				const refreshToken = getRefreshToken()

				const response = await axios.post(API_URL + "/token/refresh", {
					refresh_token: refreshToken,
				})
				const { token } = response.data

				await setToken(token)
				//replace token and retry request
				originalRequest.headers.Authorization = `Bearer ${token}`
				return axios(originalRequest)
			} catch (error) {
				//refresh token failed, remove both tokens
				// await removeTokens()
			}
		}

		return Promise.reject(error)
	}
)

const unauthorizedFetch = axios.create({
	baseURL: API_URL,
	withCredentials: false,
})


unauthorizedFetch.defaults.headers.post["Content-Type"] = "application/json"
unauthorizedFetch.defaults.headers.put["Content-Type"] = "application/json"
unauthorizedFetch.defaults.headers.patch["Content-Type"] = "application/merge-patch+json"
unauthorizedFetch.defaults.headers.delete["Content-Type"] = "application/json"
unauthorizedFetch.defaults.headers.get["Accept"] = "application/json"

const refreshAuthToken = async () => {
	const refreshToken = await getRefreshToken()
	if (!refreshToken) {
		console.log("No refresh token available")
		throw new Error("No refresh token available")
	}
	const response = await axios.post(API_URL + "/token/refresh", {
		refresh_token: refreshToken,
	})
	const { token } = response.data
	console.log("Refreshed token:", token)
	await setToken(token)
	return token
}

export { authorizedFetch, unauthorizedFetch, refreshAuthToken }