'use client'
import { useCallback, useEffect, useRef, useState } from "react"
import { Box, Divider, Group, Stack, Tabs, Text, Title } from "@mantine/core"
import { Device } from "@/interfaces/device"
import { Detection } from "@/interfaces/detection"
import { SpeciesSummary } from "@/interfaces/speciesSummary"
import { fetchDetections, fetchDevices, fetchSpeciesSummary } from "@/lib/api/devices"
import { useDetectionStream } from "@/hooks/useDetectionStream"
import DevicePicker from "@/components/devices/DevicePicker"
import DetectionList from "@/components/devices/DetectionList"
import SpeciesSummaryTable from "@/components/devices/SpeciesSummaryTable"

interface StreamConfig {
	deviceId: number
	lastId: number | null
}

const Stream = () => {
	const [devices, setDevices] = useState<Device[]>([])
	const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null)
	const [initialDetections, setInitialDetections] = useState<Detection[]>([])
	const [speciesSummary, setSpeciesSummary] = useState<SpeciesSummary[]>([])
	const [streamConfig, setStreamConfig] = useState<StreamConfig | null>(null)
	const [flashIds, setFlashIds] = useState<Set<number>>(new Set())
	const prevLiveRef = useRef<Detection[]>([])

	const handleDeviceSelect = useCallback(async (deviceId: number) => {
		setSelectedDeviceId(deviceId)
		setInitialDetections([])
		setSpeciesSummary([])
		setStreamConfig(null)
		prevLiveRef.current = []

		const [detectionsData, summaryData] = await Promise.all([
			fetchDetections(deviceId),
			fetchSpeciesSummary(deviceId).catch(() => [] as SpeciesSummary[]),
		])
		setInitialDetections(detectionsData)
		setSpeciesSummary(summaryData)
		const maxId = detectionsData.length > 0 ? Math.max(...detectionsData.map(d => d.id)) : null
		setStreamConfig({ deviceId, lastId: maxId })
	}, [])

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

	const liveIds = new Set(liveDetections.map(d => d.id))
	const allDetections = [
		...liveDetections,
		...initialDetections.filter(d => !liveIds.has(d.id)),
	].slice(0, 200)

	return (
		<Box p={20}>
			<Stack gap="lg">
				<Group justify="space-between" align="center">
					<Title order={1}>
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

				<Tabs defaultValue="summary">
					<Tabs.List>
						<Tabs.Tab value="stream">Stream</Tabs.Tab>
						<Tabs.Tab value="summary">Senaste dygnet</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value="stream" pt="md">
						<DetectionList detections={allDetections} flashIds={flashIds} />
					</Tabs.Panel>

					<Tabs.Panel value="summary" pt="md">
						<SpeciesSummaryTable
							key={selectedDeviceId ?? 0}
							initialSummary={speciesSummary}
							liveDetections={liveDetections}
						/>
					</Tabs.Panel>
				</Tabs>
			</Stack>
		</Box>
	)
}

export default Stream
