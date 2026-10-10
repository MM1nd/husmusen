import { useEffect } from 'react'
import { EventCalendarDemo } from '@/components/event-calendar-demo'

function App() {
    useEffect(() => {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')

        function updateTheme() {
            document.documentElement.classList.toggle('dark', darkModeQuery.matches)
        }

        updateTheme()
        darkModeQuery.addEventListener('change', updateTheme)

        return () => darkModeQuery.removeEventListener('change', updateTheme)
    }, [])

    return (
        <main className="mx-auto min-h-svh max-w-300 px-4 py-8 sm:px-6 sm:py-12">
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
        </main>
    )
}

export default App
