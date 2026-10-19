import type { ReactNode } from 'react'
import { Check, Circle, LoaderCircle, X } from 'lucide-react'

const statuses = {
    success: {
        Icon: Check,
        className: 'text-emerald-700 dark:text-emerald-400',
        description: 'Success',
    },
    error: {
        Icon: X,
        className: 'text-destructive',
        description: 'Error',
    },
    neutral: {
        Icon: Circle,
        className: '',
        description: 'Neutral',
    },
    loading: {
        Icon: LoaderCircle,
        className: 'animate-spin motion-reduce:animate-none',
        description: 'Loading',
    },
}

export type StatusLineStatus = keyof typeof statuses

export function StatusLine({ status, children }: {
    status: StatusLineStatus
    children: ReactNode
}) {
    const { Icon, className, description } = statuses[status]

    return (
        <span className="flex items-center gap-2 text-sm text-muted-foreground" role="status" aria-live="polite" aria-atomic="true">
            <span className="size-4 shrink-0">
                <Icon className={`size-4 ${className}`} aria-hidden="true" />
                <span className="sr-only">{description}: </span>
            </span>
            <span>{children}</span>
        </span>
    )
}
