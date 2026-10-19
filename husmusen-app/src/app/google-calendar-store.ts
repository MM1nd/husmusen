import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GoogleCalendar } from '@/lib/google-calendar'

export type CalendarAuthorization = {
    accessToken: string
    receivedAt: number // Unix timestamp in milliseconds.
    expiresInSeconds: number
}

type GoogleCalendarState = {
    requestStatus: 'idle' | 'pending' | 'failed'
    authorization: CalendarAuthorization | null
    accountEmail: string | null
    selectedCalendars: GoogleCalendar[]
    calendarConnectionStarted: () => void
    calendarConnectionSucceeded: (authorization: CalendarAuthorization) => void
    calendarConnectionFailed: () => void
    setAccountEmail: (accountEmail: string | null) => void
    setSelectedCalendars: (calendars: GoogleCalendar[]) => void
}

export const useGoogleCalendarStore = create<GoogleCalendarState>()(persist((set) => ({
    requestStatus: 'idle',
    authorization: null,
    accountEmail: null,
    selectedCalendars: [],
    calendarConnectionStarted: () => set({ requestStatus: 'pending' }),
    calendarConnectionSucceeded: (authorization) => set({
        requestStatus: 'idle',
        authorization,
    }),
    calendarConnectionFailed: () => set({ requestStatus: 'failed' }),
    setAccountEmail: (accountEmail) => set((state) => ({
        accountEmail,
        // Keep selections on token renewal, but clear them when changing accounts.
        selectedCalendars: state.accountEmail && accountEmail && state.accountEmail !== accountEmail
            ? [] : state.selectedCalendars,
    })),
    setSelectedCalendars: (selectedCalendars) => set({ selectedCalendars }),
}), {
    name: 'husmusen-google-calendar',
    partialize: (state) => ({
        accountEmail: state.accountEmail,
        selectedCalendars: state.selectedCalendars,
    }),
}))
