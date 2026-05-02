import { authorizedFetch } from "@/lib/api/helper"
import { NextRequest } from "next/server"

export const DELETE = async (
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) => {
	try {
		const { id } = await params
    console.log('Deleting card with id:', id)
		const url = `/card/${id}`
    console.log('DELETE request to URL:', url)
		const response = await authorizedFetch.delete(url)

		if (response.status !== 204) {
			return new Response(
				JSON.stringify({ message: "Failed to delete card" }),
				{
					status: response.status,
					headers: { "Content-Type": "application/json" },
				}
			)
		}

		return new Response(
			JSON.stringify({ message: "Card deleted successfully" }),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		)
	} catch (error: any) {
		console.error("Error deleting card:", error.response ?? error.message)
		return new Response(JSON.stringify({ message: "Internal server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		})
	}
}
