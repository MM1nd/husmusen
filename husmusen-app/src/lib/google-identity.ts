import { useEffect, useRef, useState } from 'react'

type GoogleIdentity = {
    initialize: (options: {
        client_id: string
        callback: (response: { credential: string }) => void
    }) => void
    renderButton: (
        element: HTMLElement,
        options: { theme: 'outline'; size: 'large' },
    ) => void
}

let identityPromise: Promise<GoogleIdentity> | undefined
let initialized = false

function loadGoogleIdentityServices(): Promise<GoogleIdentity> {
    if (identityPromise) return identityPromise

    const googleWindow = window as Window & {
        google?: { accounts: { id: GoogleIdentity } }
    }

    identityPromise = new Promise((resolve, reject) => {
        const identity = googleWindow.google?.accounts.id
        if (identity) {
            resolve(identity)
            return
        }

        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.onload = () => {
            script.onload = null
            script.onerror = null
            const loadedIdentity = googleWindow.google?.accounts.id
            if (loadedIdentity) {
                resolve(loadedIdentity)
            } else {
                reject(new Error('Google Identity Services API is unavailable.'))
            }
        }
        script.onerror = () => {
            script.onload = null
            script.onerror = null
            reject(new Error('Google Identity Services failed to load.'))
        }
        document.head.appendChild(script)
    })

    return identityPromise
}

export function useGoogleSignInButton() {
    const buttonRef = useRef<HTMLDivElement>(null)
    const [loadError, setLoadError] = useState(false)

    useEffect(() => {
        const container = buttonRef.current!
        let active = true

        loadGoogleIdentityServices().then((identity) => {
            if (!active) return

            if (!initialized) {
                identity.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: () => {
                        // TODO: Handle response.credential when session state is implemented.
                    },
                })
                initialized = true
            }

            identity.renderButton(container, { theme: 'outline', size: 'large' })
        }).catch(() => {
            if (active) setLoadError(true)
        })

        return () => {
            active = false
            container.replaceChildren()
        }
    }, [])

    return { buttonRef, loadError }
}
