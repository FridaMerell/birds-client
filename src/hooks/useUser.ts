import {useDispatch, useSelector} from 'react-redux'
import {RootState} from '@/lib/store'
import {useEffect} from 'react'
import {getUser} from '@/lib/api/user'
import {setUser} from '@/lib/features/userSlice'
import {useRouter} from 'next/navigation'
import {getToken} from '@/lib/auth'

const useUser = () => {

	const user = useSelector((state: RootState) => state.user)
	const dispatch = useDispatch()

	useEffect(() => {
		;(async () => {
			const token = await getToken()
			if (token) {
				const data = await getUser()
				dispatch(setUser(data))
			}
		})()
	}, [])

}

export default useUser