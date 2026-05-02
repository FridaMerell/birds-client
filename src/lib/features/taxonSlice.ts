import {Species} from '@/interfaces/taxon/species'

import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {Order} from '@/interfaces/order'
import {Genus} from '@/interfaces/taxon/genus'
import {TaxClass} from '@/interfaces/taxon/taxclass'
import {Family} from '@/interfaces/taxon/family'

const initialState = {
	species: [] as Species[],
	orders: [] as Order[],
	genuses: [] as Genus[],
	taxClasses: [] as TaxClass[],
	families: [] as Family[],

}


const taxonSlice = createSlice({
	name: 'taxon',
	initialState,
	reducers: {
		setSpecies(state, action: PayloadAction<Species[]>) {
			state.species = action.payload
		},
		setOrders(state, action: PayloadAction<Order[]>) {
			state.orders = action.payload
		},
		setGenuses(state, action: PayloadAction<Genus[]>) {
			state.genuses = action.payload
		},
		setTaxClasses(state, action: PayloadAction<TaxClass[]>) {
			state.taxClasses = action.payload
		},
		setFamilies(state, action: PayloadAction<Family[]>) {
			state.families = action.payload
		},
	},
})


export const {setSpecies, setOrders, setGenuses, setTaxClasses, setFamilies} = taxonSlice.actions
export default taxonSlice.reducer
