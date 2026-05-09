'use client'
import { useEffect, useRef, useState } from "react"
import { Box, Table, Text } from "@mantine/core"
import dayjs from "dayjs"
import { Detection } from "@/interfaces/detection"
import { SpeciesSummary } from "@/interfaces/speciesSummary"
import styles from "./DetectionList.module.css"

interface Props {
	initialSummary: SpeciesSummary[]
	liveDetections: Detection[]
}

const speciesKey = (s: SpeciesSummary | Detection): string => {
	const species = "species" in s ? s.species : (s as Detection).species
	return species.scientificName ?? String(species.id ?? "")
}

const formatTime = (iso: string): string => {
	const d = dayjs(iso)
	const diffMin = dayjs().diff(d, "minute")
	if (diffMin < 1) return "just now"
	if (diffMin < 60) return `${diffMin}m ago`
	const diffH = dayjs().diff(d, "hour")
	if (diffH < 24) return d.format("HH:mm")
	return d.format("D MMM HH:mm")
}

const SpeciesSummaryTable = ({ initialSummary, liveDetections }: Props) => {
	const [summary, setSummary] = useState<SpeciesSummary[]>(initialSummary)
	const [flashKeys, setFlashKeys] = useState<Set<string>>(new Set())
	const prevLiveRef = useRef<Detection[]>([])

	useEffect(() => {
		setSummary(initialSummary)
	}, [initialSummary])

	useEffect(() => {
		const prevIds = new Set(prevLiveRef.current.map(d => d.id))
		const newOnes = liveDetections.filter(d => !prevIds.has(d.id))
		prevLiveRef.current = liveDetections

		if (newOnes.length === 0) return

		const touchedKeys = new Set(newOnes.map(d => speciesKey(d)))

		setSummary(prev => {
			const map = new Map<string, SpeciesSummary>()
			prev.forEach(s => map.set(speciesKey(s), s))

			for (const det of newOnes) {
				const key = speciesKey(det)
				const existing = map.get(key)
				if (existing) {
					map.set(key, {
						...existing,
						detectionCount: existing.detectionCount + 1,
						latestDetection: det.detectedAt > existing.latestDetection
							? det.detectedAt
							: existing.latestDetection,
					})
				} else {
					map.set(key, {
						species: det.species,
						detectionCount: 1,
						latestDetection: det.detectedAt,
					})
				}
			}

			return Array.from(map.values()).sort((a, b) =>
				b.latestDetection.localeCompare(a.latestDetection)
			)
		})

		setFlashKeys(prev => new Set([...prev, ...touchedKeys]))
		setTimeout(() => {
			setFlashKeys(prev => {
				const next = new Set(prev)
				touchedKeys.forEach(k => next.delete(k))
				return next
			})
		}, 1500)
	}, [liveDetections])

	if (summary.length === 0) {
		return (
			<Box py="xl">
				<Text c="dimmed" ta="center" size="sm">
					No species detected in the last 24 hours.
				</Text>
			</Box>
		)
	}

	return (
		<Box style={{ overflowX: "auto" }}>
			<Table striped highlightOnHover withTableBorder withColumnBorders>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>Species</Table.Th>
						<Table.Th w={130}>Detections</Table.Th>
						<Table.Th w={130}>Latest</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{summary.map(s => {
						const key = speciesKey(s)
						return (
							<Table.Tr
								key={key}
								className={flashKeys.has(key) ? styles.flash : undefined}
							>
								<Table.Td>
									<Text fs="italic" size="sm">{s.species.scientificName}</Text>
									{s.species.vernacularName && (
										<Text size="xs" c="dimmed">{s.species.vernacularName}</Text>
									)}
								</Table.Td>
								<Table.Td>
									<Text size="sm" fw={500}>{s.detectionCount}</Text>
								</Table.Td>
								<Table.Td>
									<Text size="xs" c="dimmed">{formatTime(s.latestDetection)}</Text>
								</Table.Td>
							</Table.Tr>
						)
					})}
				</Table.Tbody>
			</Table>
		</Box>
	)
}

export default SpeciesSummaryTable
