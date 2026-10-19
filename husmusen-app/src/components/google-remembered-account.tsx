import { useGoogleCalendarStore } from '@/app/google-calendar-store'
import { useQuery } from '@tanstack/react-query'
import { StatusLine } from '@/components/status-line'
import type { StatusLineStatus } from '@/components/status-line'
import { googleAccountEmailQueryOptions } from '@/lib/google-identity'

export function GoogleRememberedAccount() {
    const accountEmail = useGoogleCalendarStore((state) => state.accountEmail)
    const accessToken = useGoogleCalendarStore((state) => state.authorization?.accessToken ?? null)
    if (accessToken !== null) {
        return <GoogleRememberedAccountWithAuthorization accessToken={accessToken} accountEmail={accountEmail} />
    } else {
        return <RememberedAccountDisplay accountEmail={accountEmail} />
    }
}

function GoogleRememberedAccountWithAuthorization({ accessToken, accountEmail }: {
    accessToken: string
    accountEmail: string | null
}) {
    const emailQuery = useQuery({
        ...googleAccountEmailQueryOptions(accessToken),
        // Observe the lookup started by authorization; mounting this UI must not start one.
        enabled: false,
    })
    return (
        <RememberedAccountDisplay
            accountEmail={accountEmail}
            isBusy={emailQuery.isFetching || emailQuery.isPaused}
            isSuccess={emailQuery.isSuccess}
            isError={emailQuery.isError}
        />
    )
}

function RememberedAccountDisplay({ accountEmail, isBusy = false, isSuccess = false, isError = false }: {
    accountEmail: string | null
    isBusy?: boolean
    isSuccess?: boolean
    isError?: boolean
}) {
    let text: string
    let status: StatusLineStatus

    if (isBusy) {
        status = 'loading'
        text = 'Looking up Google account email...'
    } else if (accountEmail) {
        status = isSuccess ? 'success' : 'neutral'
        text = `Remembered Google account: ${accountEmail}`
    } else {
        status = 'error'
        text = isError ? 'Google account email lookup failed.' : 'No Google account remembered.'
    }

    return (
        <StatusLine status={status}>{text}</StatusLine>
    )
}
