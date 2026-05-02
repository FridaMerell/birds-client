'use client'
import { useEffect, useRef, useState } from "react"
import { Detection } from "@/interfaces/detection"

const MAX_DETECTIONS = 200

export function useDetectionStream(enabled: boolean, initialLastId: number | null) {
	const [detections, setDetections] = useState<Detection[]>([])
	const [connected, setConnected] = useState(false)
	const esRef = useRef<EventSource | null>(null)
	const lastIdRef = useRef<number | null>(initialLastId)
	const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		lastIdRef.current = initialLastId
	}, [initialLastId])

	useEffect(() => {
		if (!enabled) {
			esRef.current?.close()
			if (reconnectRef.current) clearTimeout(reconnectRef.current)
			setDetections([])
			setConnected(false)
			return
		}

		setDetections([])
		setConnected(false)

		const connect = () => {
			esRef.current?.close()

			const params = new URLSearchParams()
			if (lastIdRef.current !== null) {
				params.set("lastId", String(lastIdRef.current))
			}

			const es = new EventSource(`/api/detections/stream?${params}`)
			esRef.current = es

			es.onopen = () => setConnected(true)

			es.onmessage = (event) => {
				const detection: Detection = JSON.parse(event.data)
				lastIdRef.current = detection.id
				setDetections(prev => [detection, ...prev].slice(0, MAX_DETECTIONS))
			}

			es.onerror = () => {
				setConnected(false)
				es.close()
				reconnectRef.current = setTimeout(connect, 3000)
			}
		}

		connect()

		return () => {
			esRef.current?.close()
			if (reconnectRef.current) clearTimeout(reconnectRef.current)
		}
	}, [enabled])

	return { detections, connected }
}
