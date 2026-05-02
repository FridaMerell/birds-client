'use client'
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useDispatch } from "react-redux"
import axios from 'axios'
import { useForm } from '@mantine/form'
import { Button, Card, Group, PasswordInput, TextInput, Title } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { setToken } from "@/lib/auth"
import { getUser } from "@/lib/features/userSlice"
import { AppDispatch } from "@/lib/store"
import useCurrentUser from "@/hooks/useCurrentUser"

type Inputs = {
	email: string,
	password: string
}

const LoginForm = () => {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const context = useCurrentUser()
	const searchParams = useSearchParams()
	const redirectTo = searchParams.get('redirect') || '/'
	const form = useForm({
		initialValues: {
			email: '',
			password: ''
		},


		validate: {
			email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
		},
	})


	const onSubmit = async (data: Inputs) => {
		setLoading(true)

		const response = await axios.post('/api/login', data, { validateStatus: (status) => status < 500 })
		console.log('response', response)
		let status = response.status
		if (status === 200) {
			context.setUser(response.data.token)
			notifications.show({
				title: 'Login successful',
				message: 'Welcome back!',
				color: 'green'
			})
			router.refresh()
			router.push(redirectTo)
		} else {
			notifications.show({
				title: 'Login failed',
				message: 'Invalid email or password',
				color: 'red'
			})
		}

		setLoading(false)
	}

	return <Card w={500} p={35}>
		<Title ta={'center'} mb={20}>Logga in</Title>
		<form onSubmit={form.onSubmit(onSubmit)}>
			<TextInput label="E-post" key={'email'} required {...form.getInputProps('email')} />
			<PasswordInput label="Lösenord" key={'password'} required {...form.getInputProps('password')} type="password" />
			<Button mt={40} type="submit" disabled={loading} >Logga in</Button>
		</form>
	</Card>
}

export default LoginForm