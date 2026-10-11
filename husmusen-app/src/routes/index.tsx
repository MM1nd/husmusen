import { createFileRoute } from '@tanstack/react-router'
import { CalendarPage } from '@/components/pages/calendar-page'

export const Route = createFileRoute('/')({
    component: CalendarPage,
})
