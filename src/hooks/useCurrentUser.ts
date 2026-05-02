import { useContext } from 'react'
import { UserContext } from '@/providers/UserProvider'

export const useCurrentUser = () => {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error('useCurrentUser must be used within a UserProvider')
  }
  return ctx
}

export default useCurrentUser
