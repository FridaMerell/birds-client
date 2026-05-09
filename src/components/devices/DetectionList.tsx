'use client'
import { Detection } from "@/interfaces/detection"
import { Badge, Box, Group, Progress, Table, Text } from "@mantine/core"
import dayjs from "dayjs"
import styles from "./DetectionList.module.css"

interface DetectionListProps {
	detections: Detection[]
	flashIds: Set<number>
}

const confidenceColor = (c: number): string => {
	if (c >= 0.8) return "teal"
	if (c >= 0.6) return "yellow"
	return "orange"
}

const formatTime = (iso: string): string => {
	const d = dayjs(iso)
	const diffMin = dayjs().diff(d, "minute")
	if (diffMin < 1) return "just now"
	if (diffMin < 60) return `${diffMin}m ago`
	return d.format("HH:mm")
}

const DetectionList = ({ detections, flashIds }: DetectionListProps) => {
	if (detections.length === 0) {
		return (
			<Box py="xl">
				<Text c="dimmed" ta="center" size="sm">
					No detections yet. Select a device to start.
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
						<Table.Th w={220}>Confidence</Table.Th>
						<Table.Th w={100}>Time</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{detections.map(d => (
						<Table.Tr
							key={d.id}
							className={flashIds.has(d.id) ? styles.flash : undefined}
						>
							<Table.Td>
								<Text fs="italic" size="sm">{d.species.scientificName}</Text>
								{d.species.vernacularName && (
									<Text size="xs" c="dimmed">{d.species.vernacularName}</Text>
								)}
							</Table.Td>
							<Table.Td>
								<Group gap="xs" wrap="nowrap">
									<Progress
										value={d.confidence * 100}
										color={confidenceColor(d.confidence)}
										size="sm"
										style={{ flex: 1 }}
									/>
									<Badge
										color={confidenceColor(d.confidence)}
										size="sm"
										variant="light"
										w={52}
									>
										{Math.round(d.confidence * 100)}%
									</Badge>
								</Group>
							</Table.Td>
							<Table.Td>
								<Text size="xs" c="dimmed">
									{formatTime(d.detectedAt)}
								</Text>
							</Table.Td>
						</Table.Tr>
					))}
				</Table.Tbody>
			</Table>
		</Box>
	)
}

export default DetectionList
