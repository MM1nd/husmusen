import { useEffect, useState } from 'react'
import { Check, Hourglass, LoaderCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useGoogleCalendarStore } from '@/app/google-calendar-store'
import { Button } from '@/components/ui/button'
import { initializeGoogleCalendarAuthorization } from '@/lib/google-identity'
import type { CalendarTokenClient } from '@/lib/google-identity'

const renewalWindowMs = 5 * 60 * 1000

export function GoogleCalendarConnectButton() {
    const requestStatus = useGoogleCalendarStore((state) => state.requestStatus)
    const authorization = useGoogleCalendarStore((state) => state.authorization)
    const accountEmail = useGoogleCalendarStore((state) => state.accountEmail)
    const calendarConnectionStarted = useGoogleCalendarStore((state) => state.calendarConnectionStarted)
    const [initialization, setInitialization] = useState<
        | { status: 'loading' }
        | { status: 'ready'; client: CalendarTokenClient }
        | { status: 'error' }
    >({ status: 'loading' })
    const [now, setNow] = useState(Date.now)
    const expiresInMs = authorization
        ? authorization.expiresInSeconds * 1000 - (now - authorization.receivedAt) : 0
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
            calendarConnectionStarted()
            // Keep this synchronous so the popup opens directly from the button click.
            initialization.client.requestAccessToken(accountEmail
                ? { login_hint: accountEmail, prompt: '' }
                : { prompt: 'select_account' })
        }
    }

    return (
        <CalendarConnectDisplay
            requestStatus={requestStatus}
            initializationStatus={initialization.status}
            tokenIsValid={tokenIsValid}
            tokenHasEnoughLifetime={tokenHasEnoughLifetime}
            connect={connect}
        />
    )
}

function CalendarConnectDisplay({ requestStatus, initializationStatus, tokenIsValid, tokenHasEnoughLifetime, connect }: {
    requestStatus: 'idle' | 'pending' | 'failed'
    initializationStatus: 'loading' | 'ready' | 'error'
    tokenIsValid: boolean
    tokenHasEnoughLifetime: boolean
    connect?: () => void
}) {
    let text: string
    const isBusy = requestStatus === 'pending' || initializationStatus === 'loading'
    let isActive = false
    const disabled = initializationStatus !== 'ready' || requestStatus === 'pending'

    if (requestStatus === 'pending') {
        text = 'Requesting calendar access'
    } else if (requestStatus === 'failed') {
        text = 'Retry requesting calendar access'
    } else if (tokenHasEnoughLifetime) {
        // Active access, including while the client initializes in the background.
        text = 'Google Calendar access active'
        isActive = true
    } else if (tokenIsValid) {
        text = 'Renew calendar access'
    } else if (initializationStatus === 'loading') {
        text = 'Preparing calendar access'
    } else if (initializationStatus === 'error') {
        text = 'Calendar unavailable'
    } else {
        text = 'Request calendar access'
    }

    let Icon: LucideIcon | undefined
    if (isBusy) {
        Icon = LoaderCircle
    } else if (isActive) {
        Icon = Check
    } else if (tokenIsValid) {
        Icon = Hourglass
    }
    const iconClassName = isBusy
        ? 'size-4 shrink-0 animate-spin motion-reduce:animate-none'
        : 'size-4 shrink-0'

    if (isActive) {
        return (
            <div className="w-80 max-w-full space-y-3" aria-busy={isBusy || undefined}>
                <div className="flex min-h-10 items-center justify-center gap-2 border border-emerald-600/40 px-3 text-sm text-emerald-700 dark:text-emerald-400">
                    {Icon && <Icon className={iconClassName} aria-hidden="true" />}
                    <span role="status">{text}</span>
                </div>
            </div>
        )
    } else {
        return (
            <div className="w-80 max-w-full space-y-3" aria-busy={isBusy || undefined}>
                <Button
                    variant="outline"
                    className="w-full enabled:cursor-pointer enabled:hover:border-primary enabled:hover:bg-primary enabled:hover:text-primary-foreground"
                    onClick={connect}
                    disabled={disabled}
                >
                    {Icon && <Icon className={iconClassName} aria-hidden="true" />}
                    <span role="status">{text}</span>
                </Button>
            </div>
        )
    }
}
