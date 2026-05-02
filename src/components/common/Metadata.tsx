'use client'

import { useDocumentTitle } from "@mantine/hooks"

const Metadata = ({title, description }: {title: string, description: string}) => {
  useDocumentTitle(title ? title + ' - Börds' : "Börds")
  return null
}

export default Metadata