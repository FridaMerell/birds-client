import { unauthorizedFetch } from "@/lib/api/helper"
import { Card, Pagination, SimpleGrid } from "@mantine/core"
import dayjs from "dayjs"
import List from "./List"

export const loadSightings = async (page: number, filters: any) => {
    let url = "/sightings?page=" + page
    if (filters.user) {
        url += `&user=${filters.user}`
    }
    if (filters.search) {
        url += `&species.vernacularName=${filters.search}`
    }
    if (filters.from) {
        url += `&dateTime[after]=${filters.from}`
    }
    if (filters.to) {
        url += `&dateTime[before]=${filters.to}`
    }
    if (filters.location) {
        url += `&location=${filters.location}`
    }
    console.log("Loading sightings from URL:", url)
    let response = await unauthorizedFetch(url, {
        headers: {
            'Accept': 'application/ld+json'
        }
    })
    return response.data
}

const Page = async ({ params, searchParams }: { params: { page: string }, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {

    const page = Number((await params).page) || 1
    const searchParamsResolved = await searchParams
    const { user, search, from:from, before: to, location } = searchParamsResolved
    const { member: sightings, links, totalItems } = await loadSightings(page, {
        user,
        search,
        from,
        to,
        location
    })
    return <>
        <List sightings={sightings} totalItems={totalItems} currentPage={page} />
    </>
}

export default Page