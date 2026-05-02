import {Sighting} from '@/interfaces/sighting'
import {createSlice, PayloadAction} from '@reduxjs/toolkit'

const initialState = {
	sightings: [] as Sighting[],
	newSightings: [] as Sighting[],
}


const gluttSlice = createSlice({
	name: 'glutt',
	initialState,
	reducers: {
		setSightings(state, action: PayloadAction<Sighting[]>) {
			state.sightings = action.payload
		},
		addSighting(state, action: PayloadAction<Sighting>) {
			state.newSightings.push(action.payload)
		},
	},
})

export const {setSightings, addSighting} = gluttSlice.actions
export default gluttSlice.reducer