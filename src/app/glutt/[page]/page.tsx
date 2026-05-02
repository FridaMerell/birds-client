import { unauthorizedFetch } from "@/lib/api/helper"
import { Card, Pagination, SimpleGrid } from "@mantine/core"
import dayjs from "dayjs"
import List from "../List"
import { loadSightings } from "../page"



const Page = async ({ params, searchParams }: { params: { page: string }, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
    
    const page = Number((await params).page) || 1
    const searchParamsResolved = await searchParams
    const { user, search, from, to, location } = searchParamsResolved
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