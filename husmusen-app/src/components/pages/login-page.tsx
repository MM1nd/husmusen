import { GoogleSignInButton } from '@/components/google-sign-in-button'
import { PageHeading } from '@/components/page-heading'
import { Section } from '@/components/section'

export function LoginPage() {
    return (
        <div className="space-y-6">
            <PageHeading title="Sign in" />
            <Section aria-label="Sign in">
                <GoogleSignInButton />
            </Section>
        </div>
    )
}
