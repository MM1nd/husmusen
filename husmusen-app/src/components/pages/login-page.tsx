import { GoogleSignInButton } from '@/components/google-sign-in-button'
import { GoogleCalendarConnectButton } from '@/components/google-calendar-connect-button'

export function LoginPage() {
    return (
        <section className="space-y-6">
            <h1 className="font-heading text-3xl font-medium tracking-wide uppercase sm:text-4xl">
                Sign in to Husmusen
            </h1>
            <GoogleSignInButton />
            <GoogleCalendarConnectButton />
        </section>
    )
}
