'use client'
import { useCallback, useEffect, useRef, useState } from "react"
import { Box, Divider, Group, MantineProvider, Stack, Text, Title } from "@mantine/core"
import theme from "@/theme/theme"
import { Device } from "@/interfaces/device"
import { Detection } from "@/interfaces/detection"
import { fetchDetections, fetchDevices } from "@/lib/api/devices"
import { useDetectionStream } from "@/hooks/useDetectionStream"
import DevicePicker from "@/components/devices/DevicePicker"
import DetectionList from "@/components/devices/DetectionList"

interface StreamConfig {
	deviceId: number
	lastId: number | null
}

const Stream = () => {
	const [devices, setDevices] = useState<Device[]>([])
	const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null)
	const [initialDetections, setInitialDetections] = useState<Detection[]>([])
	const [streamConfig, setStreamConfig] = useState<StreamConfig | null>(null)
	const [flashIds, setFlashIds] = useState<Set<number>>(new Set())
	const prevLiveRef = useRef<Detection[]>([])

	const handleDeviceSelect = useCallback(async (deviceId: number) => {
		setSelectedDeviceId(deviceId)
		setInitialDetections([])
		setStreamConfig(null)
		prevLiveRef.current = []

		const data = await fetchDetections(deviceId)
		setInitialDetections(data)
		const maxId = data.length > 0 ? Math.max(...data.map(d => d.id)) : null
		setStreamConfig({ deviceId, lastId: maxId })
	}, [])

	// Load devices on mount; auto-select the first active one
	useEffect(() => {
		fetchDevices().then(data => {
			setDevices(data)
			const first = data.find(d => d.active) ?? data[0]
			if (first) handleDeviceSelect(first.id)
		})
	}, [handleDeviceSelect])

	const { detections: liveDetections, connected } = useDetectionStream(
		streamConfig !== null,
		streamConfig?.lastId ?? null
	)

	// Detect newly arrived SSE rows and schedule flash removal
	useEffect(() => {
		const prevIds = new Set(prevLiveRef.current.map(d => d.id))
		const newOnes = liveDetections.filter(d => !prevIds.has(d.id))

		if (newOnes.length > 0) {
			const ids = new Set(newOnes.map(d => d.id))
			setFlashIds(prev => new Set([...prev, ...ids]))
			setTimeout(() => {
				setFlashIds(prev => {
					const next = new Set(prev)
					ids.forEach(id => next.delete(id))
					return next
				})
			}, 1500)
		}

		prevLiveRef.current = liveDetections
	}, [liveDetections])

	// Merge live (top) + initial history, deduplicated by id
	const liveIds = new Set(liveDetections.map(d => d.id))
	const allDetections = [
		...liveDetections,
		...initialDetections.filter(d => !liveIds.has(d.id)),
	].slice(0, 200)

	console.log("Rendering Stream with config:", streamConfig, "Live detections:", liveDetections, "Initial detections:", initialDetections)

	return (
		<Box p={20}>
			<Stack gap="lg">
				<Group justify="space-between" align="center">
					<Title order={1}  >
						BirdNet Stream
					</Title>
					<Group gap={6} align="center">
						<Box
							w={9}
							h={9}
							style={{
								borderRadius: "50%",
								backgroundColor: connected
									? "var(--mantine-color-teal-5)"
									: "var(--mantine-color-red-6)",
								boxShadow: connected
									? "0 0 6px var(--mantine-color-teal-5)"
									: "none",
								transition: "background-color 0.4s, box-shadow 0.4s",
							}}
						/>
						<Text size="sm" c={connected ? "teal.4" : "dimmed"}>
							{connected ? "Live" : "Offline"}
						</Text>
					</Group>
				</Group>
				<Divider />
				<DevicePicker
					devices={devices}
					selectedId={selectedDeviceId}
					onChange={handleDeviceSelect}
				/>

				<DetectionList detections={allDetections} flashIds={flashIds} />
			</Stack>
		</Box>
	)
}

export default Stream
