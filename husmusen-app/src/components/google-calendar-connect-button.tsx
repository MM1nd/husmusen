import { useEffect, useState } from 'react'
import { Check, Hourglass, LoaderCircle } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { store } from '@/app/store'
import { calendarConnectionStarted } from '@/app/google-calendar-slice'
import { Button } from '@/components/ui/button'
import { initializeGoogleCalendarAuthorization } from '@/lib/google-identity'
import type { CalendarTokenClient } from '@/lib/google-identity'

const renewalWindowMs = 5 * 60 * 1000

export function GoogleCalendarConnectButton() {
    const calendar = useAppSelector((state) => state.googleCalendar)
    const [initialization, setInitialization] = useState<
        | { status: 'loading' }
        | { status: 'ready'; client: CalendarTokenClient }
        | { status: 'error' }
    >({ status: 'loading' })
    const [now, setNow] = useState(Date.now)
    const expiresInMs = calendar.authorization
        ? calendar.authorization.expiresInSeconds * 1000 - (now - calendar.authorization.receivedAt) : 0
    const tokenIsValid = expiresInMs > 0
    const tokenHasEnoughLifetime = expiresInMs > renewalWindowMs

    useEffect(() => {
        let active = true
        initializeGoogleCalendarAuthorization().then((client) => {
            if (active) setInitialization({ status: 'ready', client })
        }, () => {
            if (active) setInitialization({ status: 'error' })
        })
        return () => { active = false }
    }, [])

    useEffect(() => {
        const refresh = () => setNow(Date.now())
        window.addEventListener('focus', refresh)
        let timeout: number | undefined
        if (tokenIsValid) {
            // Re-render when renewal becomes available, then when access expires.
            const nextChangeInMs = tokenHasEnoughLifetime
                ? expiresInMs - renewalWindowMs : expiresInMs
            timeout = window.setTimeout(refresh, Math.max(0, nextChangeInMs - (Date.now() - now)))
        }
        return () => {
            window.clearTimeout(timeout)
            window.removeEventListener('focus', refresh)
        }
    }, [expiresInMs, now, tokenIsValid, tokenHasEnoughLifetime])

    let connect: (() => void) | undefined
    if (initialization.status === 'ready') {
        connect = () => {
            store.dispatch(calendarConnectionStarted())
            // Keep this synchronous so the popup opens directly from the button click.
            initialization.client.requestAccessToken()
        }
    }

    if (calendar.requestStatus === 'pending') {
        // Token pending.
        return (
            <div className="w-80 max-w-full space-y-3" aria-busy>
                <Button variant="outline" className="w-full" disabled>
                    <LoaderCircle className="size-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    <span role="status">Requesting calendar access</span>
                </Button>
            </div>
        )
    } else if (calendar.requestStatus === 'failed') {
        // Error obtaining the token.
        return (
            <div className="w-80 max-w-full space-y-3">
                <Button
                    variant="outline"
                    className="w-full enabled:cursor-pointer enabled:hover:border-primary enabled:hover:bg-primary enabled:hover:text-primary-foreground"
                    onClick={connect}
                    disabled={initialization.status !== 'ready'}
                >
                    <span role="status">Retry requesting calendar access</span>
                </Button>
            </div>
        )
    } else if (tokenHasEnoughLifetime) {
        // Active access, including while the client initializes in the background.
        return (
            <div className="w-80 max-w-full space-y-3">
                <div
                    role="status"
                    className="flex min-h-10 items-center justify-center gap-2 border border-emerald-600/40 px-3 text-sm text-emerald-700 dark:text-emerald-400"
                >
                    <Check className="size-4 shrink-0" aria-hidden="true" />
                    <span>Google Calendar access active</span>
                </div>
            </div>
        )
    } else if (tokenIsValid) {
        // Token about to expire: valid, but within the renewal window.
        return (
            <div className="w-80 max-w-full space-y-3">
                <Button
                    variant="outline"
                    className="w-full enabled:cursor-pointer enabled:hover:border-primary enabled:hover:bg-primary enabled:hover:text-primary-foreground"
                    onClick={connect}
                    disabled={initialization.status !== 'ready'}
                >
                    <Hourglass className="size-4 shrink-0" aria-hidden="true" />
                    <span role="status">Renew calendar access</span>
                </Button>
            </div>
        )
    } else if (initialization.status === 'loading') {
        // Initialising without a valid token.
        return (
            <div className="w-80 max-w-full space-y-3" aria-busy>
                <Button variant="outline" className="w-full" disabled>
                    <LoaderCircle className="size-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    <span role="status">Preparing calendar access</span>
                </Button>
            </div>
        )
    } else if (initialization.status === 'error') {
        // Initialisation error without a valid token.
        return (
            <div className="w-80 max-w-full space-y-3">
                <Button variant="outline" className="w-full" disabled>
                    <span role="status">Calendar unavailable</span>
                </Button>
            </div>
        )
    } else {
        // No valid token: either expired or never obtained; the client is ready.
        return (
            <div className="w-80 max-w-full space-y-3">
                <Button
                    variant="outline"
                    className="w-full enabled:cursor-pointer enabled:hover:border-primary enabled:hover:bg-primary enabled:hover:text-primary-foreground"
                    onClick={connect}
                >
                    <span role="status">Request calendar access</span>
                </Button>
            </div>
        )
    }
}
