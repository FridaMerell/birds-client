'use client'
import { Provider as ReduxProvider } from "react-redux"
import React, { ReactNode, useRef } from "react"
import { AppStore, makeStore } from "@/lib/store"
import {  Flex, MantineProvider,  Stack } from '@mantine/core'
import theme from "@/theme/theme"
import { useDisclosure, useHeadroom } from "@mantine/hooks"
import { Notifications } from '@mantine/notifications'
import Navigation from "./Navigation"
import { UserProvider } from '@/providers/UserProvider'
import { SpeciesProvider } from "@/providers/SpeciesProvider"
import QuickObserve from "@/components/common/QuickObserve"

interface ProvidersProps {
	children: ReactNode
}

interface ProvidersProps {
	children: React.ReactNode
	initialUser: any
}

const Providers = ({ children, initialUser }: ProvidersProps) => {

	const storeRef = useRef<AppStore | null>(null)
	if (!storeRef.current) {
		storeRef.current = makeStore()

	}

	return (
		<ReduxProvider store={storeRef.current}>
			<UserProvider>
				<SpeciesProvider>
					<MantineProvider theme={theme}>
						<Flex mih='100%' pos={'relative'} justify={'stretch'} align={'stretch'}>
							<Navigation />
							<Stack gap="md" pb={'150px'} w={'100%'} px={{ base: 10, md: 50 }}>
								{children}
							</Stack>
						</Flex>
						<Notifications />
						<QuickObserve />
					</MantineProvider>
				</SpeciesProvider>
			</UserProvider>
		</ReduxProvider>
	)
}

export default Providers
