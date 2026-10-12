import { useGoogleSignInButton } from '@/lib/google-identity'

export function LoginPage() {
    const { buttonRef, loadError } = useGoogleSignInButton()

    return (
        <section className="space-y-6">
            <h1 className="font-heading text-3xl font-medium tracking-wide uppercase sm:text-4xl">
                Sign in to Husmusen
            </h1>
            <div ref={buttonRef} />
            {loadError && (
                <p role="alert">Google sign-in could not load. Please reload to try again.</p>
            )}
        </section>
    )
}
