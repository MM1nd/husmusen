import { EventCalendarDemo } from '@/components/event-calendar-demo'
import { GoogleCalendarConnectButton } from '@/components/google-calendar-connect-button'
import { PageHeading } from '@/components/page-heading'
import { Section } from '@/components/section'

export function DemoPage() {
    return (
        <div className="space-y-6">
            <PageHeading title="Demo" />
            <Section heading="Google Calendar connection">
                <GoogleCalendarConnectButton />
            </Section>
            <Section heading="Calendar">
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    A FullCalendar example with sample events. Drag events to move them,
                    or resize them in week/day view. Changes reset on reload.
                </p>
                <EventCalendarDemo />
            </Section>
        </div>
    )
}
