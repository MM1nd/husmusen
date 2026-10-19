import { infiniteQueryOptions, skipToken } from '@tanstack/react-query'
import type { CalendarAuthorization } from '@/app/google-calendar-store'

export type GoogleCalendar = {
    id: string
    summary?: string
    summaryOverride?: string
    backgroundColor?: string
    primary?: boolean
}

type CalendarListResponse = {
    items?: GoogleCalendar[]
    nextPageToken?: string
}

export function googleCalendarsQueryOptions(
    authorization: CalendarAuthorization | null,
) {
    return infiniteQueryOptions({
        // Scope cached results and in-flight requests to this authorization.
        queryKey: ['google-calendars', 'infinite', authorization],
        retry: false,
        queryFn: authorization
            ? async ({ signal, pageParam }) => {
                try {
                    return await fetchGoogleCalendarsPage(authorization, signal, pageParam)
                } catch (error) {
                    if (!signal.aborted) console.error('Google Calendar list request failed:', error)
                    throw error
                }
            }
            : skipToken,
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextPageToken || undefined,
    })
}

async function fetchGoogleCalendarsPage(
    authorization: CalendarAuthorization,
    signal: AbortSignal,
    pageToken: string | undefined,
): Promise<CalendarListResponse> {
    if (Date.now() >= authorization.receivedAt + authorization.expiresInSeconds * 1000) {
        throw new Error('Google Calendar access has expired. Renew access to load calendars.')
    }

    const url = new URL('https://www.googleapis.com/calendar/v3/users/me/calendarList')
    url.searchParams.set('maxResults', '250')
    url.searchParams.set('showHidden', 'true')
    if (pageToken) url.searchParams.set('pageToken', pageToken)

    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${authorization.accessToken}` },
        signal,
    })

    if (!response.ok) {
        throw new Error(response.status === 401
            ? 'Google Calendar access has expired. Renew access to load calendars.'
            : 'Could not load Google calendars. Please try again by requesting calendar access.')
    }

    return response.json()
}
