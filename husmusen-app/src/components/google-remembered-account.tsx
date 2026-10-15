import { useGoogleCalendarStore } from '@/app/google-calendar-store'
import { useQuery } from '@tanstack/react-query'
import { Check, LoaderCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
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
    let Icon: LucideIcon | undefined
    let iconClassName: string | undefined
    let iconDescription: string | undefined
    let showError = false

    if (accountEmail) {
        text = `Remembered Google account: ${accountEmail}`
        if (isBusy) {
            Icon = LoaderCircle
            iconClassName = 'size-4 animate-spin motion-reduce:animate-none'
            iconDescription = 'Looking up Google account email.'
        } else if (isSuccess) {
            Icon = Check
            iconClassName = 'size-4 text-emerald-700 dark:text-emerald-400'
            iconDescription = 'Google account email lookup succeeded.'
        }
    } else if (isBusy) {
        text = 'Looking up Google account email...'
        Icon = LoaderCircle
        iconClassName = 'size-4 animate-spin motion-reduce:animate-none'
    } else if (isError) {
        text = 'Google account email lookup failed.'
        showError = true
    } else {
        text = 'No Google account remembered.'
    }

    return (
        <p className={`flex items-center gap-2 text-sm ${showError ? 'text-destructive' : 'text-muted-foreground'}`}>
            <span className="size-4 shrink-0">
                {Icon && (
                    <>
                        <Icon
                            className={iconClassName}
                            aria-hidden="true"
                        />
                        {iconDescription && <span className="sr-only">{iconDescription}</span>}
                    </>
                )}
            </span>
            <span>{text}</span>
        </p>
    )
}
