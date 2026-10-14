import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type CalendarAuthorization = {
    accessToken: string
    receivedAt: number // Unix timestamp in milliseconds.
    expiresInSeconds: number
}

type GoogleCalendarState = {
    requestStatus: 'idle' | 'pending' | 'failed'
    authorization: CalendarAuthorization | null
}

const initialState: GoogleCalendarState = {
    requestStatus: 'idle',
    authorization: null,
}

const googleCalendarSlice = createSlice({
    name: 'googleCalendar',
    initialState,
    reducers: {
        calendarConnectionStarted(state) {
            state.requestStatus = 'pending'
        },
        calendarConnectionSucceeded(state, action: PayloadAction<CalendarAuthorization>) {
            state.requestStatus = 'idle'
            state.authorization = action.payload
        },
        calendarConnectionFailed(state) {
            state.requestStatus = 'failed'
        },
    },
})

export const {
    calendarConnectionStarted,
    calendarConnectionSucceeded,
    calendarConnectionFailed,
} = googleCalendarSlice.actions
export default googleCalendarSlice.reducer
