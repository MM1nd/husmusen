import { useGoogleCalendarStore } from '@/app/google-calendar-store'
import { useQuery } from '@tanstack/react-query'
import { Check, LoaderCircle } from 'lucide-react'
import { googleAccountEmailQueryOptions } from '@/lib/google-identity'

export function GoogleRememberedAccount() {
    const accountEmail = useGoogleCalendarStore((state) => state.accountEmail)
    const accessToken = useGoogleCalendarStore((state) => state.authorization?.accessToken ?? null)
    return (
        <div className="space-y-1 text-sm text-muted-foreground">
            {accessToken !== null ? (
                <GoogleRememberedAccountWithAuthorization accessToken={accessToken} accountEmail={accountEmail} />
            ) : accountEmail ? (
                <p className="flex items-center gap-2">
                    <span className="size-4 shrink-0" aria-hidden="true" />
                    <span>Remembered Google account: {accountEmail}</span>
                </p>
            ) : (
                <p>No Google account remembered.</p>
            )}
        </div>
    )
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
    const isBusy = emailQuery.isFetching || emailQuery.isPaused

    if (accountEmail) {
        return (
            <p className="flex items-center gap-2" role="status">
                <span className="size-4 shrink-0">
                    {isBusy && (
                        <>
                            <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                            <span className="sr-only">Looking up Google account email.</span>
                        </>
                    )}
                    {!isBusy && emailQuery.isSuccess && (
                        <>
                            <Check className="size-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                            <span className="sr-only">Google account email lookup succeeded.</span>
                        </>
                    )}
                </span>
                <span>Remembered Google account: {accountEmail}</span>
            </p>
        )
    } else if (isBusy) {
        return (
            <p className="flex items-center gap-2" role="status">
                <LoaderCircle className="size-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                <span>Looking up Google account email...</span>
            </p>
        )
    } else if (emailQuery.isError) {
        return (
            <p role="alert" className="text-destructive">Google account email lookup failed.</p>
        )
    } else {
        return (
            <p>No Google account remembered.</p>
        )
    }
}
