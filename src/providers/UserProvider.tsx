'use client'
import React, { createContext, useCallback, useEffect, useMemo, useReducer } from 'react'
import type { User } from '@/interfaces/user'

type State = {
  user: User | null
  loading: boolean
  error?: string | null
}

type Actions =
  | { type: 'SET_USER'; payload: User }
  | { type: 'CLEAR_USER' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

const initialState: State = {
  user: null,
  loading: false,
  error: null,
}

function reducer(state: State, action: Actions): State {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, error: null }
    case 'CLEAR_USER':
      return { ...state, user: null, error: null }
    case 'UPDATE_USER':
      return state.user
        ? { ...state, user: { ...state.user, ...action.payload } }
        : state
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    default:
      return state
  }
}

type ContextValue = {
  state: State
  setUser: (user: User) => void
  clearUser: () => void
  updateUser: (patch: Partial<User>) => void
  refreshUser: () => Promise<void>
  refreshToken: () => Promise<boolean>
  signOut: (redirectTo?: string) => Promise<boolean>
}

export const UserContext = createContext<ContextValue | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setUser = useCallback((user: User) => {
    dispatch({ type: 'SET_USER', payload: user })
  }, [])

  const clearUser = useCallback(() => {
    dispatch({ type: 'CLEAR_USER' })
  }, [])

  const updateUser = useCallback((patch: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: patch })
  }, [])

  const refreshUser = useCallback(async () => {
    // Attempt to load current user via server-side token handling
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })
    try {
      // This route refreshes the token if possible and returns the user
      const res = await fetch('/api/user/token', { method: 'GET', credentials: 'include' })
      if (res.ok) {
        const data: User = await res.json()
        if (data && (data as any).id) {
          dispatch({ type: 'SET_USER', payload: data })
        } else {
          // No valid user in response
          dispatch({ type: 'CLEAR_USER' })
        }
      } else {
        // Token refresh or user fetch failed; clear tokens server-side
        await fetch('/api/logout', { method: 'POST', credentials: 'include' })
        dispatch({ type: 'CLEAR_USER' })
        dispatch({ type: 'SET_ERROR', payload: `Failed to fetch user (${res.status})` })
      }
    } catch (err: any) {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' })
      dispatch({ type: 'CLEAR_USER' })
      dispatch({ type: 'SET_ERROR', payload: err?.message ?? 'Unexpected error' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/token/refresh', { method: 'POST', credentials: 'include' })
      return res.ok
    } catch {
      return false
    }
  }, [])

  const signOut = useCallback(async (redirectTo?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/logout', { method: 'POST', credentials: 'include' })
      // Clear local user state regardless of server outcome
      dispatch({ type: 'CLEAR_USER' })
      if (res.ok && redirectTo) {
        window.location.href = redirectTo
      }
      return res.ok
    } catch {
      dispatch({ type: 'CLEAR_USER' })
      return false
    }
  }, [])

  useEffect(() => {
    // Auto-fetch on mount; if server cookies exist, user will be loaded
    refreshUser()
  }, [refreshUser])

  const value = useMemo<ContextValue>(() => ({ state, setUser, clearUser, updateUser, refreshUser, refreshToken, signOut }), [state, setUser, clearUser, updateUser, refreshUser, refreshToken, signOut])

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export default UserProvider
