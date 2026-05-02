import {authorizedFetch} from "./helper"
import axios from 'axios'
import {getToken} from '@/lib/auth'

export const getUser = async () => {

	const result = await authorizedFetch('/user/me',{
		validateStatus : (status) => status >= 200 && status < 500
	})


	return result.status === 200 ? result.data : null
}