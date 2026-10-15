import { toast } from 'sonner'
import { useGoogleCalendarStore } from '@/app/google-calendar-store'

const googleServicesLoadToastId = 'google-services-load'
const calendarScope = 'https://www.googleapis.com/auth/calendar.readonly'
const emailScope = 'https://www.googleapis.com/auth/userinfo.email'
const authorizationErrorId = 'google-calendar-authorization'

type GoogleIdentity = {
    initialize: (options: {
        client_id: string
        callback: (response: { credential: string }) => void
    }) => void
    renderButton: (
        element: HTMLElement,
        options: {
            theme: 'outline' | 'filled_black'
            size: 'large'
            shape?: 'rectangular'
        },
    ) => void
}

type CalendarTokenResponse = {
    access_token?: string
    expires_in?: number
    scope?: string
    error?: string
}

export type CalendarTokenClient = {
    requestAccessToken: (options?: { login_hint?: string; prompt?: string }) => void
}

type GoogleAccounts = {
    id: GoogleIdentity
    oauth2: {
        initTokenClient: (options: {
            client_id: string
            scope: string
            callback: (response: CalendarTokenResponse) => void
            error_callback: (error: { type: string }) => void
        }) => CalendarTokenClient
        hasGrantedAllScopes: (response: CalendarTokenResponse, scope: string) => boolean
    }
}



let googleAccountsPromise: Promise<GoogleAccounts> | undefined
let calendarTokenClientPromise: Promise<CalendarTokenClient> | undefined

export function loadGoogleIdentityServices(): Promise<GoogleAccounts> {
    if (googleAccountsPromise) return googleAccountsPromise

    const googleWindow = window as Window & {
        google?: { accounts: GoogleAccounts }
    }

    googleAccountsPromise = new Promise<GoogleAccounts>((resolve, reject) => {
        function _resolve(accounts: GoogleAccounts) {
            toast.dismiss(googleServicesLoadToastId)
            resolve(accounts)
        }

        const identity = googleWindow.google?.accounts
        if (identity) {
            _resolve(identity)
            return
        }

        const script = document.createElement('script')

        function _reject(message: string) {
            script.remove()
            const error = new Error(message)
            console.error(error)
            toast.error(error.message, {
                id: googleServicesLoadToastId,
                description: 'Refresh the page to try again.',
                duration: Infinity,
                action: {
                    label: 'Refresh',
                    onClick: () => window.location.reload(),
                },
            })
            reject(error)
        }

        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.onload = () => {
            const loadedIdentity = googleWindow.google?.accounts
            if (loadedIdentity) {
                script.onload = null
                script.onerror = null
                _resolve(loadedIdentity)
            } else {
                _reject('Google Identity Services API is unavailable.')
            }
        }
        script.onerror = () => {
            _reject('Google Identity Services failed to load.')
        }
        document.head.appendChild(script)
    })

    return googleAccountsPromise
}

export function initializeGoogleCalendarAuthorization(): Promise<CalendarTokenClient> {
    // Share initialization across components, remounts, and Strict Mode effects.
    calendarTokenClientPromise ??= loadGoogleIdentityServices().then((accounts) => {
        return accounts.oauth2.initTokenClient({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            scope: `${calendarScope} ${emailScope}`,
            callback: (response) => {
                if (response.error || !response.access_token || !response.expires_in ||
                    !accounts.oauth2.hasGrantedAllScopes(response, calendarScope)) {
                    const message = 'Google Calendar permission was not granted. Please try again.'
                    console.error('Google Calendar authorization failed', response.error ?? message)
                    useGoogleCalendarStore.getState().calendarConnectionFailed()
                    toast.error(message, { id: authorizationErrorId })
                    return
                }

                const authorization = {
                    accessToken: response.access_token,
                    receivedAt: Date.now(),
                    expiresInSeconds: response.expires_in,
                }
                useGoogleCalendarStore.getState().calendarConnectionSucceeded(authorization)
                if (accounts.oauth2.hasGrantedAllScopes(response, emailScope)) {
                    void rememberGoogleAccountEmail(authorization.accessToken)
                } else {
                    const message = 'Google account email permission was not granted.'
                    console.warn(message)
                    toast.warning(message)
                }
            },
            error_callback: (popupError) => {
                const message = popupError.type === 'popup_closed'
                    ? 'Google Calendar connection was cancelled.'
                    : 'Google Calendar authorization could not open. Please try again.'
                console.error('Google Calendar authorization failed', popupError.type ?? message)
                useGoogleCalendarStore.getState().calendarConnectionFailed()
                if (popupError.type === 'popup_closed') {
                    toast.info(message, { id: authorizationErrorId })
                } else {
                    toast.error(message, { id: authorizationErrorId })
                }
            },
        })
    })

    return calendarTokenClientPromise
}

async function rememberGoogleAccountEmail(accessToken: string): Promise<void> {
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (!response.ok) {
            const message = `Could not retrieve the Google account email (HTTP ${response.status}).`
            console.warn(message)
            toast.warning(message)
            return
        }
        const user: { email?: unknown } = await response.json()
        if (typeof user.email !== 'string' || !user.email.trim()) {
            const message = 'Google returned a missing or invalid account email.'
            console.warn(message)
            toast.warning(message)
            return
        }

        // A delayed lookup must not overwrite the email for a newer authorization.
        const store = useGoogleCalendarStore.getState()
        if (store.authorization?.accessToken === accessToken) {
            store.setAccountEmail(user.email)
        }
    } catch (error) {
        const message = 'Could not request or read the Google account email response.'
        console.warn(message, error)
        toast.warning(message)
        return
    }
}
