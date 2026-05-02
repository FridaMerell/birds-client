'use server'
import { TaxClass } from '@/interfaces/taxon/taxclass'
import { getTaxonList } from '@/lib/api/taxon'
import { Button, Card, CardSection, Container, Divider, Flex, Group, Space, Stack, Text, Title } from '@mantine/core'
import React from 'react'
import EditClass from './EditClass'
import NewClass from './NewClass'
import AddSpecies from './AddSpecies'


const Page = async () => {

	const taxons = await getTaxonList(0)

	return <Stack gap="xl" p={20}>
		<Title order={1}>Klasser/kategorier</Title>
		<Divider />
		<Flex gap={30} wrap={'wrap'}>
			{taxons && taxons.map((taxon: TaxClass) => {
				return <Card miw={300} withBorder p={20} shadow="xs" key={taxon.id}>
					<Flex justify="space-between" align="center">
						<Text size="xl" tt={'capitalize'}>{taxon.vernacularName}</Text>

						<EditClass taxon={taxon} />
					</Flex>
					<Text size="sm" c="gray" mt={5}>{taxon.scientificName}</Text>
					<Group gap={10} mt={10}>
						<Button variant="light" color="primary" mt={10} component='a' href={'/taxon/' + taxon.scientificName} >Visa</Button>
						<Button variant="light" color="secondary" mt={10} component='a' href={'/taxon/' + taxon.scientificName + '/species'} >Visa arter</Button>
						<AddSpecies taxon={taxon} />
					</Group>
				</Card>
			})}
			<NewClass />
		</Flex>
	</Stack>
}

export default Page