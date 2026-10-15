import { useGoogleCalendarStore } from '@/app/google-calendar-store'

export function GoogleRememberedAccount() {
    const accountEmail = useGoogleCalendarStore((state) => state.accountEmail)

    return (
        <p className="text-sm text-muted-foreground">
            {accountEmail ? `Remembered Google account: ${accountEmail}` : 'No Google account remembered.'}
        </p>
    )
}
