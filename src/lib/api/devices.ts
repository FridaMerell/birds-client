"use server"
import { Detection } from "@/interfaces/detection"
import { Device } from "@/interfaces/device"
import { authorizedFetch } from "./helper"

export const fetchDevices = async (): Promise<Device[]> => {
	const res = await authorizedFetch.get("/api/devices")
	return res.data
}

export const fetchDetections = async (deviceId: number): Promise<Detection[]> => {
	const res = await authorizedFetch.get(`/api/birdnet/detections?deviceId=${deviceId}`)
	return res.data
}
