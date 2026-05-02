'use server'
import {authorizedFetch, unauthorizedFetch} from "./helper"

export const getTaxon = async (id: number) => {}

export const getTaxonList = async (offset: number) => {
	let result = unauthorizedFetch.get(`tax_classes?offset=${offset}`)
	return (await result).data
}

export const getOrderList = async (
	taxClass: string | null = null,
	offset: number = 0
) => {
	'use server'
	let url = `orders?offset=${offset}`
	if (taxClass) {
		url += `&properties[class][]=${taxClass}`
	}
	let result = await unauthorizedFetch.get(url)
	return (result).data
}
