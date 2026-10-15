import { useId } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

type SectionProps = ComponentPropsWithoutRef<'section'> & {
    heading?: string
}

export function Section({ heading, children, className, ...props }: SectionProps) {
    const headingId = useId()

    return (
        <section
            aria-labelledby={heading ? headingId : undefined}
            {...props}
            className={cn('space-y-6', className)}
        >
            {heading && (
                <h2 id={headingId} className="font-heading text-2xl font-medium sm:text-3xl">
                    {heading}
                </h2>
            )}
            {children}
        </section>
    )
}
