import { useEffect, useState } from 'react'
import { useGoogleCalendarStore } from '@/app/google-calendar-store'
import type { CalendarAuthorization } from '@/app/google-calendar-store'
import { fetchGoogleCalendars } from '@/lib/google-calendar'
import type { GoogleCalendar } from '@/lib/google-calendar'

type CalendarListState =
    | { status: 'loading' }
    | { status: 'ready'; calendars: GoogleCalendar[] }
    | { status: 'error'; message: string }

export function GoogleCalendarList() {
    const authorization = useGoogleCalendarStore((state) => state.authorization)

    if (!authorization) {
        return <p className="text-sm text-muted-foreground">Connect Google Calendar to see available calendars.</p>
    }

    return <AuthorizedCalendarList key={authorization.receivedAt} authorization={authorization} />
}

function AuthorizedCalendarList({ authorization }: { authorization: CalendarAuthorization }) {
    const [state, setState] = useState<CalendarListState>({ status: 'loading' })

    useEffect(() => {
        const controller = new AbortController()

        fetchGoogleCalendars(authorization, controller.signal).then(
            (calendars) => {
                if (!controller.signal.aborted) setState({ status: 'ready', calendars })
            },
            (error: unknown) => {
                if (!controller.signal.aborted) {
                    setState({
                        status: 'error',
                        message: error instanceof Error ? error.message : 'Could not load Google calendars.',
                    })
                }
            },
        )

        return () => controller.abort()
    }, [authorization])

    if (state.status === 'loading') {
        return <p role="status" className="text-sm text-muted-foreground">Loading calendars…</p>
    }

    if (state.status === 'error') {
        return <p role="alert" className="text-sm text-destructive">{state.message}</p>
    }

    if (state.calendars.length === 0) {
        return <p role="status" className="text-sm text-muted-foreground">No calendars available.</p>
    }

    return (
        <ul aria-label="Available Google calendars" className="max-w-md divide-y rounded-md border">
            {state.calendars.map((calendar) => (
                <li key={calendar.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                    <span
                        aria-hidden="true"
                        className="size-3 shrink-0 rounded-full border bg-muted"
                        style={{ backgroundColor: calendar.backgroundColor }}
                    />
                    <span className="min-w-0 break-words">
                        {calendar.summaryOverride || calendar.summary || calendar.id}
                    </span>
                    {calendar.primary && <span className="ml-auto text-xs text-muted-foreground">Primary</span>}
                </li>
            ))}
        </ul>
    )
}
