"use server"
import { Detection } from "@/interfaces/detection"
import { Device } from "@/interfaces/device"
import { SpeciesSummary } from "@/interfaces/speciesSummary"
import { authorizedFetch } from "./helper"

export const fetchDevices = async (): Promise<Device[]> => {
	const res = await authorizedFetch.get("/api/devices")
	return res.data
}

export const fetchDetections = async (deviceId: number): Promise<Detection[]> => {
	const res = await authorizedFetch.get(`/api/birdnet/detections?deviceId=${deviceId}`)
	return res.data
}

export const fetchSpeciesSummary = async (deviceId: number): Promise<SpeciesSummary[]> => {
	const res = await authorizedFetch.get(`/api/birdnet/species-summary?deviceId=${deviceId}`)
	return res.data
}
