type PageHeadingProps = {
    title: string
    eyebrow?: string
}

export function PageHeading({
    title,
    eyebrow = 'Husmusen · Test release',
}: PageHeadingProps) {
    return (
        <header className="space-y-3">
            <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
                {eyebrow}
            </p>
            <h1 className="font-heading text-3xl font-medium tracking-wide uppercase sm:text-4xl">
                {title}
            </h1>
        </header>
    )
}
