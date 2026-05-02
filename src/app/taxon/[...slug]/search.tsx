"use client"
import { useState } from "react"
const Search = ({ params: { slug } }: { params: { slug: string[] }}) => {
  const [isOpen, setIsOpen] = useState(false)
  return <div>Search page for {slug.join('/')}</div>
}

export default Search