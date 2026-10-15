import { EventCalendarDemo } from '@/components/event-calendar-demo'
import { PageHeading } from '@/components/page-heading'
import { Section } from '@/components/section'

export function CalendarPage() {
    return (
        <div className="space-y-6">
            <PageHeading title="Calendar" />
            <Section aria-label="Example calendar">
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    A FullCalendar example with sample events. Drag events to move them,
                    or resize them in week/day view. Changes reset on reload.
                </p>
                <EventCalendarDemo />
            </Section>
        </div>
    )
}
