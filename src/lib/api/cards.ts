
import { unauthorizedFetch } from "./helper"

export const getCards = async () => {
	let results = await unauthorizedFetch("/cards")
	return results.data
}


export const getCard = async (id: string) => {
	let results = await unauthorizedFetch(`/card/${id}`)
	return results.data
}