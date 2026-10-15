import { PageHeading } from '@/components/page-heading'
import { Section } from '@/components/section'

export function TermsOfUsePage() {
    return (
        <article className="mx-auto max-w-2xl space-y-10 sm:space-y-12">
            <PageHeading title="Terms of Use" />

            <aside aria-label="Usage restriction" className="space-y-2 border-l-4 border-destructive bg-destructive/5 px-5 py-4">
                <p className="font-semibold">Do NOT use this application.</p>
                <p className="text-sm leading-6 text-muted-foreground">
                    This application is currently available only to selected test users.
                </p>
            </aside>

            <Section heading="Data Usage">
                <ul className="list-disc space-y-4 pl-5 text-base leading-7 marker:text-muted-foreground">
                    <li className="pl-1">
                        <strong>Do NOT use this application.</strong> The restriction above applies.
                    </li>
                    <li className="pl-1">
                        This application does not have a central backend. Visit the{' '}
                        <a
                            href="https://github.com/MM1nd/husmusen"
                            className="font-medium underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
                        >
                            Husmusen GitHub repository
                        </a>{' '}
                        to learn more.
                    </li>
                    <li className="pl-1">
                        Google integration features may exchange data with Google.
                    </li>
                    <li className="pl-1">
                        Data you provide may be processed locally on your machine.
                    </li>
                </ul>
            </Section>
        </article>
    )
}
