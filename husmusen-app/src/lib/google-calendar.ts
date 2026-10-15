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

export async function fetchGoogleCalendars(
    authorization: CalendarAuthorization,
    signal: AbortSignal,
): Promise<GoogleCalendar[]> {
    if (Date.now() >= authorization.receivedAt + authorization.expiresInSeconds * 1000) {
        throw new Error('Google Calendar access has expired. Renew access to load calendars.')
    }

    const calendars: GoogleCalendar[] = []
    let pageToken: string | undefined

    do {
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

        const page: CalendarListResponse = await response.json()
        calendars.push(...(page.items ?? []))
        pageToken = page.nextPageToken
    } while (pageToken)

    return calendars
}
