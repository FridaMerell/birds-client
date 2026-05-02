'use client'
import React, { useEffect, useLayoutEffect, useState } from "react"
import { Box, Button, Card, CardSection, Divider, Flex, LoadingOverlay, ScrollArea, Text, ThemeIcon, Title } from "@mantine/core"
import { Observation } from "@/interfaces/artdatabanken/observation"
import { IconRefresh } from "@tabler/icons-react"
import SingleSighting from "./SingleSighting"

const NearbySightings = () => {
	const [geoLocation, setGeoLocation] = useState({
		latitude: 0,
		longitude: 0
	})
	const [error, setError] = useState("")
	const [loading, setLoading] = useState(false)
	const [sightings, setSightings] = useState([] as any[])
	const [page, setPage] = useState(0)

	useEffect(() => {
		if (!geoLocation.latitude || !geoLocation.longitude) return

		fetchSightings()

	}, [geoLocation])

	useEffect(() => {

		// Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
		navigator.geolocation.getCurrentPosition(({ coords }) => {
			const { latitude, longitude } = coords

			setGeoLocation({ latitude, longitude })
		}, (error) => {
			console.error(error)
		})


	}, [])

	useLayoutEffect(() => {
		console.log("Page changed:", page)
		fetchSightings()
	}, [page])

	const DatetimeToLocaleString = (datetime: string) => {
		const date = new Date(datetime)
		return date.toLocaleString()
	}

	const fetchSightings = async () => {
		setLoading(true)
		try {
			const response = await fetch("/api/artfakta/nearby", {
				method: "POST",
				body: JSON.stringify({ ...geoLocation, page }),
				headers: {
					"Content-Type": "application/json"
				}
			})
			const data = await response.json()
			setSightings([
				...sightings, ...data
			])
		} catch (err) {
			setError("Failed to fetch nearby sightings.")
		} finally {
			setLoading(false)
		}
	}

	return (
		<Card p={20} >
			<Flex justify={'space-between'} align={'center'}>

				<Title order={3}>I närheten:</Title>
				{
					geoLocation.latitude && geoLocation.longitude ? (
						<ThemeIcon onClick={() => {
							setSightings([])
							setGeoLocation({
								latitude: geoLocation.latitude,
								longitude: geoLocation.longitude
							})
						}} variant="filled" >
							<IconRefresh

								style={{ cursor: "pointer" }}
							/>
						</ThemeIcon>
					)
						:
						<Text>Fetching location...</Text>
				}
			</Flex>
			<Divider my={10} />

			{error && <Text>{error}</Text>}
			<ScrollArea h={400} onBottomReached={() => {
				setPage(page + 1)
			}}>
				<LoadingOverlay visible={loading} />
				{
					sightings?.map((sighting: Observation, index: number) => (
						<SingleSighting key={index} sighting={sighting} />
					))
				}
				<Button fullWidth variant="light" mt="md" onClick={() => {
					setPage(page + 1)
				}}>
					Ladda fler
				</Button>
			</ScrollArea>
		</Card>
	)
}

export default NearbySightings
