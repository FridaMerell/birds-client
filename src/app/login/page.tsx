'use server'
import LoginForm from "@/components/routes/login/LoginForm"
import { Center, Flex } from "@mantine/core"
import { Metadata } from "next"
import { cookies } from "next/headers"



const LoginPage = async () => {
	return (
		<Center h={'100%'} p={30}>
			<LoginForm />
		</Center>
	)
}

export default LoginPage