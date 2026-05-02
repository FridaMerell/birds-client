"use client"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { unauthorizedFetch } from "../api/helper"
import { RootState } from "../store"
import { notifications } from "@mantine/notifications"
import { Location } from "@/interfaces/location"

const initialState = {
	appLoaded: false,
	navigationObjects: [] as any[],
	locations: [] as any[],
	fetchingLocations: false,
	quickObserveSpecies: null as any | null,
}

export const fetchLocations = createAsyncThunk(
	"app/fetchLocations",
	async () => {
		const response = await fetch("/api/locations")
		let data = await response.json()
		return data
	},
	{
		condition: (_, { getState }) => {
			const state = getState() as RootState
			return !state.app.fetchingLocations && state.app.locations.length === 0
		},
	}
)

export const saveLocation = createAsyncThunk(
	"app/saveLocation",
	async (locationData: Location, thunkAPI) => {
		try {
			if (locationData.id) {
				const response = await fetch(`/api/locations/${locationData.id}`, {
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(locationData),
				})
				let data = await response.json()
				return data
			} else {
				const response = await fetch("/api/locations", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(locationData),
				})
				let data = await response.json()
				return response.status === 201
					? data
					: thunkAPI.rejectWithValue({
							error: "Failed to create location",
					  })
			}
		} catch (error) {
			console.error("Failed to save location:", error)
			return thunkAPI.rejectWithValue({
				error: "Failed to save location",
			})
		}
	}
)

export const deleteLocation = createAsyncThunk(
	"app/deleteLocation",
	async (locationId: string, thunkAPI) => {
		try {
			const response = await fetch(`/api/locations/${locationId}`, {
				method: "DELETE",
			})
			if (response.ok) {
				return { id: locationId }
			} else {
				return thunkAPI.rejectWithValue({
					error: "Failed to delete location",
				})
			}
		} catch (error) {
			console.error("Failed to delete location:", error)
			return thunkAPI.rejectWithValue({
				error: "Failed to delete location",
			})
		}
	}
)

const appSlice = createSlice({
	name: "app",
	initialState,
	reducers: {
		setAppLoaded(state, action: PayloadAction<boolean>) {
			state.appLoaded = action.payload
		},
		setNavigationObjects(state, action: PayloadAction<React.ReactNode[]>) {
			state.navigationObjects = action.payload
		},
		setLocations(state, action: PayloadAction<any[]>) {
			state.locations = action.payload
		},
		setQuickObserveSpecies(state, action: PayloadAction<any | null>) {
			state.quickObserveSpecies = action.payload
		},
	},
	extraReducers: builder => {
		builder
			.addCase(fetchLocations.pending, state => {
				state.fetchingLocations = true
			})
			.addCase(fetchLocations.fulfilled, (state, action) => {
				state.fetchingLocations = false
				state.locations = action.payload
			})
			.addCase(fetchLocations.rejected, state => {
				state.fetchingLocations = false
			})
			.addCase(deleteLocation.fulfilled, (state, action) => {
				state.locations = state.locations.filter(location => {
					return location.id !== parseInt(action.payload.id)
				})
			})
			.addCase(deleteLocation.rejected, (state, action) => {
				console.error("Error deleting location:", action.payload)
			})
			.addCase(saveLocation.fulfilled, (state, action) => {
				const index = state.locations.findIndex(
					location => location.id === action.payload.id
				)
				if (index > 0) {
					state.locations[index] = action.payload
				} else {
					state.locations.push(action.payload)
				}
			})
			.addCase(saveLocation.rejected, (state, action) => {
				console.error("Error saving location:", action.payload)
			})
	},
})

export const {
	setAppLoaded,
	setNavigationObjects,
	setLocations,
	setQuickObserveSpecies,
} = appSlice.actions
export default appSlice.reducer
