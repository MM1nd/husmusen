import { configureStore } from '@reduxjs/toolkit'
import googleCalendarReducer from './google-calendar-slice'

export const store = configureStore({
  reducer: { googleCalendar: googleCalendarReducer },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store
