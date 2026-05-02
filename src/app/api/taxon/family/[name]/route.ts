import { NextRequest } from "next/server"

export const GET = async (
	request: NextRequest,
	{ params }: { params: Promise<{ name: string }> }
) => {
	const scientificName = (await params).name
}