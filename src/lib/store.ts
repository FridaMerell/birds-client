import { configureStore } from '@reduxjs/toolkit'
import userSlice from './features/userSlice'
import gluttSlice from '@/lib/features/gluttSlice'
import taxonSlice from '@/lib/features/taxonSlice'
import appSlice from '@/lib/features/appSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userSlice,
      glutt: gluttSlice,
      taxon:taxonSlice,
      app: appSlice
    }
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']