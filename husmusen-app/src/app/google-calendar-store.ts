import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CalendarAuthorization = {
    accessToken: string
    receivedAt: number // Unix timestamp in milliseconds.
    expiresInSeconds: number
}

type GoogleCalendarState = {
    requestStatus: 'idle' | 'pending' | 'failed'
    authorization: CalendarAuthorization | null
    accountEmail: string | null
    calendarConnectionStarted: () => void
    calendarConnectionSucceeded: (authorization: CalendarAuthorization) => void
    calendarConnectionFailed: () => void
    setAccountEmail: (accountEmail: string | null) => void
}

export const useGoogleCalendarStore = create<GoogleCalendarState>()(persist((set) => ({
    requestStatus: 'idle',
    authorization: null,
    accountEmail: null,
    calendarConnectionStarted: () => set({ requestStatus: 'pending' }),
    calendarConnectionSucceeded: (authorization) => set({
        requestStatus: 'idle',
        authorization,
    }),
    calendarConnectionFailed: () => set({ requestStatus: 'failed' }),
    setAccountEmail: (accountEmail) => set({ accountEmail }),
}), {
    name: 'husmusen-google-calendar',
    partialize: (state) => ({ accountEmail: state.accountEmail }),
}))
