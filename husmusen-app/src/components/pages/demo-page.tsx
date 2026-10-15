import { GoogleCalendarConnectButton } from '@/components/google-calendar-connect-button'
import { PageHeading } from '@/components/page-heading'
import { Section } from '@/components/section'

export function DemoPage() {
    return (
        <div className="space-y-6">
            <PageHeading title="Demo" />
            <Section aria-label="Google Calendar connection">
                <p>Test the Google Calendar connection.</p>
                <GoogleCalendarConnectButton />
            </Section>
        </div>
    )
}
