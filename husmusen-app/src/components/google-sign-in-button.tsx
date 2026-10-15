import { useEffect, useRef, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { loadGoogleIdentityServices } from '@/lib/google-identity'

let initialized = false

export function GoogleSignInButton() {
    const buttonRef = useRef<HTMLDivElement>(null)
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

    useEffect(() => {
        const container = buttonRef.current!
        let active = true

        loadGoogleIdentityServices().then((accounts) => {
            if (!active) return
            const identity = accounts.id

            if (!initialized) {
                identity.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: () => {
                        // TODO: Handle response.credential when session state is implemented.
                    },
                })
                initialized = true
            }

            identity.renderButton(container, {
                theme: window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'filled_black' : 'outline',
                size: 'large',
                shape: 'rectangular',
            })
            setStatus('ready')
        }, () => {
            if (!active) return
            setStatus('error')
        })

        return () => {
            active = false
            container.replaceChildren()
        }
    }, [])

    return (
        <div className="min-h-10 w-80 max-w-full" aria-busy={status === 'loading'}>
            {status !== 'ready' && (
                <Button
                    type="button"
                    variant="outline"
                    disabled
                    className="h-10 w-full gap-2 rounded border-[#747775] bg-white px-3 text-sm font-medium tracking-normal normal-case text-[#1f1f1f] disabled:opacity-100 dark:border-[#202124] dark:bg-[#202124] dark:text-white"
                >
                    {status === 'loading' && (
                        <>
                            <LoaderCircle className="size-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                            <span role="status">Loading Google sign-in…</span>
                        </>
                    )}
                    {status === 'error' && (
                        <span role="status">Google sign-in unavailable</span>
                    )}
                </Button>
            )}
            <div ref={buttonRef} hidden={status !== 'ready'} />
        </div>
    )
}

