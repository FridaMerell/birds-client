'use client'
import { Select } from "@mantine/core"
import { Device } from "@/interfaces/device"

interface DevicePickerProps {
	devices: Device[]
	selectedId: number | null
	onChange: (deviceId: number) => void
}

const DevicePicker = ({ devices, selectedId, onChange }: DevicePickerProps) => {
	const data = devices.map(d => ({
		value: String(d.id),
		label: d.active ? d.name : `${d.name} (inactive)`,
	}))

	return (
		<Select
			label="Device"
			placeholder="Select a device…"
			data={data}
			value={selectedId !== null ? String(selectedId) : null}
			onChange={val => val && onChange(Number(val))}
			disabled={devices.length === 0}
			allowDeselect={false}
			w={{ base: "100%", sm: 320 }}
		/>
	)
}

export default DevicePicker
