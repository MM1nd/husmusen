import { EventCalendarDemo } from '@/components/event-calendar-demo'

export function CalendarPage() {
    return (
        <>
            <header className="space-y-3">
                <h1 className="font-heading text-3xl font-medium tracking-wide uppercase sm:text-4xl">
                    Husmusen calendar
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    A FullCalendar example with sample events. Drag events to move them,
                    or resize them in week/day view. Changes reset on reload.
                </p>
            </header>
            <section aria-label="Example calendar">
                <EventCalendarDemo />
            </section>
        </>
    )
}
