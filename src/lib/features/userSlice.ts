// store/authSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { User } from "@/interfaces/user"
const initialState = {
	token: null,
	refreshToken: null,
	user: null as User | null,
}

export const getUser = createAsyncThunk(
	"auth/getUser",
	async (token?: string) => {
        console.log('getUser called with token:', token)
		const response = await fetch("/api/user", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		if (response.status !== 200) {
			return null
		}
		return (await response.json()) as User
	}
)

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setAuthToken(state, action) {
			state.token = action.payload.token
			state.refreshToken = action.payload.refresh_token
		},
		setUser(state, action) {
			state.user = action.payload
		},
		logout(state) {
			state.token = null
			state.user = null
			localStorage.removeItem("token") // Clear token from localStorage upon logout
			localStorage.removeItem("refreshToken") // Clear refreshToken from localStorage upon logout
		},
	},
	extraReducers: builder => {
		builder.addCase(getUser.fulfilled, (state, action) => {
			state.user = action.payload
		})
	},
})

export const { setAuthToken, setUser, logout } = authSlice.actions
export default authSlice.reducer
