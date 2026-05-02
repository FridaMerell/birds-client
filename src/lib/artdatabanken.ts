"use server"
import axios from "axios"

const authorizedFetch = axios.create({
	baseURL: "https://api.artdatabanken.se",
	headers: {
		"Ocp-Apim-Subscription-Key": process.env.ARTDATA_PRIMARY,
	},
})

export async function getSpecies(taxonomyId: string) {
	let url =
		"information/v1/speciesdataservice/v1/speciesdata?taxa=" + taxonomyId

	const response = await authorizedFetch.get(url).catch(error => {
		console.error("Error fetching species data:", error)
		return null
	})
	return response?.data
}

export async function getNearbySightings(
	latitude?: number,
	longitude?: number,
	taxonomyIds?: string[],
	page = 0,
	radius: number = 30000
) {
	let url =
		"species-observation-system/v1/Observations/Search?skip=" +
		page * 15 +
		"&take=15&sortOrder=desc&sortBy=event.startDate"
	let filters: any = {
		output: {
			fieldSet: "Extended",
		},
	}
	if (latitude && longitude)
		filters = {
			geographics: {
				maxDistanceFromPoint: radius,
				geometries: [
					{
						type: "Point",
						coordinates: [longitude, latitude],
					},
				],
			},
		}

	if (taxonomyIds && taxonomyIds.length > 0) {
		filters = {
			...filters,
			taxon: { ids: taxonomyIds, includeUnderlyingTaxa: true },
		}
	}
	const response = await authorizedFetch.post(url, filters)
	return response.data?.records
}

export const getOccurances = async (longitude: number, latitude: number) => {
	//https://api.artdatabanken.se/data-stewardship-api/v1/occurrences[?skip][&take][&exportMode][&responseCoordinateSystem]
	let url = "data-stewardship-api/v1/occurrences?skip=0&take=10"
	const response = await authorizedFetch.post(url, {})
	console.log("occurances response", response.data)
	return response.data.records
}

export const getSoundsForSpecies = async (scientificName: string) => {
	let url = `https://xeno-canto.org/api/3/recordings?query=sp:"${encodeURIComponent(
		scientificName
	)}"&key=${process.env.XENO_CANTO_API_KEY}&per_page=50&page=1`
	const response = await axios.get(url).catch(error => {
		console.error("Error fetching species sounds:", error)
		return null
	})
	return response?.data
}

export const getObservationCount = async (taxonomyIds: string[]) => {
	let url = "species-observation-system/v1/Observations/TaxonAggregation"
	let filters: any = {
		taxon: {
			ids: taxonomyIds,
			includeUnderlyingTaxa: true,
			taxonListOperator: "Filter",
		},
		date: {
			startDate: "2020-01-01",
			endDate: new Date().toISOString().split("T")[0],
		},
	}

	const response = await authorizedFetch.post(url, filters)
	return response.data
}

export const getGeoGridAggregation = async (
	taxonomyIds: string[],
	metricGridSize: number = 15
) => {
	let url =
		"species-observation-system/v1/Observations/GeoGridAggregation?zoom=8"
	let filters: any = {
		taxon: { ids: taxonomyIds, includeUnderlyingTaxa: true, taxonListOperator: "Filter" },
		date: {
			startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split("T")[0],
			endDate: new Date().toISOString().split("T")[0],
		},
		metricGridSize: metricGridSize
	}

	const response = await authorizedFetch.post(url, filters)
	return response.data
}
