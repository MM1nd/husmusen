
import { EventCalendarDemo } from '@/components/event-calendar-demo'


function App() {
    return (
        <main className="calendar-page">
            <header className="page-header">
                <h1>Husmusen calendar</h1>
                <p>A FullCalendar example with sample events. Drag events to move them, or resize them in week/day view. Changes reset on reload.</p>
            </header>
            <section className="calendar-card" aria-label="Example calendar">
                <EventCalendarDemo />
            </section>
        </main>
    )
}

export default App

