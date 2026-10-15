import { useEffect, useState } from 'react'
import { Check, Hourglass, LoaderCircle, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useGoogleCalendarStore } from '@/app/google-calendar-store'
import { Button } from '@/components/ui/button'
import { initializeGoogleCalendarAuthorization } from '@/lib/google-identity'
import type { CalendarTokenClient } from '@/lib/google-identity'

const minuteMs = 60 * 1000
const renewalWindowMs = 5 * minuteMs

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
        if (!tokenIsValid) return

        const refresh = () => setNow(Date.now())
        window.addEventListener('focus', refresh)
        const timeout = window.setTimeout(refresh, Math.min(minuteMs, expiresInMs))
        return () => {
            window.clearTimeout(timeout)
            window.removeEventListener('focus', refresh)
        }
    }, [expiresInMs, now, tokenIsValid])

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
        <div className="w-80 max-w-full space-y-3">
            <CalendarConnectDisplay
                requestStatus={requestStatus}
                initializationStatus={initialization.status}
                tokenIsValid={tokenIsValid}
                tokenHasEnoughLifetime={tokenHasEnoughLifetime}
                expiresInMs={expiresInMs}
                connect={connect}
            />
            <CalendarAccessStatus tokenIsValid={tokenIsValid} />
        </div>
    )
}

function CalendarAccessStatus({ tokenIsValid }: { tokenIsValid: boolean }) {
    if (tokenIsValid) {
        return (
            <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
                <Check className="size-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                <span>Google Calendar access active</span>
            </p>
        )
    } else {
        return (
            <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
                <X className="size-4 shrink-0 text-destructive" aria-hidden="true" />
                <span>Google Calendar access inactive</span>
            </p>
        )
    }
}

function CalendarConnectDisplay({ requestStatus, initializationStatus, tokenIsValid, tokenHasEnoughLifetime, expiresInMs, connect }: {
    requestStatus: 'idle' | 'pending' | 'failed'
    initializationStatus: 'loading' | 'ready' | 'error'
    tokenIsValid: boolean
    tokenHasEnoughLifetime: boolean
    expiresInMs: number
    connect?: () => void
}) {
    let text: string
    const isBusy = !tokenHasEnoughLifetime && (requestStatus === 'pending' || initializationStatus === 'loading')
    const disabled = tokenHasEnoughLifetime || initializationStatus !== 'ready' || requestStatus === 'pending'

    if (tokenHasEnoughLifetime) {
        // Show the countdown even while the client initializes in the background.
        text = `Access expires in ${Math.ceil(expiresInMs / minuteMs)} min`
    } else if (requestStatus === 'pending') {
        text = 'Requesting calendar access'
    } else if (requestStatus === 'failed') {
        text = 'Retry requesting calendar access'
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
    } else if (tokenIsValid) {
        Icon = Hourglass
    }
    const iconClassName = isBusy
        ? 'size-4 shrink-0 animate-spin motion-reduce:animate-none'
        : 'size-4 shrink-0'

    return (
        <Button
            variant="outline"
            className="w-full enabled:cursor-pointer enabled:hover:border-primary enabled:hover:bg-primary enabled:hover:text-primary-foreground"
            onClick={connect}
            disabled={disabled}
            aria-busy={isBusy || undefined}
        >
            {Icon && <Icon className={iconClassName} aria-hidden="true" />}
            <span>{text}</span>
        </Button>
    )
}
