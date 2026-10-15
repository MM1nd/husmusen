import { createFileRoute } from '@tanstack/react-router'
import { DemoPage } from '@/components/pages/demo-page'

export const Route = createFileRoute('/demo')({
    component: DemoPage,
})
