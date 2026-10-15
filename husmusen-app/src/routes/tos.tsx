import { createFileRoute } from '@tanstack/react-router'
import { TermsOfUsePage } from '@/components/pages/terms-of-use-page'

export const Route = createFileRoute('/tos')({
    component: TermsOfUsePage,
})
