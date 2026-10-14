import type { CSSProperties } from 'react'
import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
    return (
        <SonnerToaster
            position="top-center"
            theme="system"
            closeButton
            mobileOffset={16}
            style={{
                '--width': 'min(48rem, calc(100vw - 2rem))',
                '--normal-bg': 'var(--popover)',
                '--normal-text': 'var(--popover-foreground)',
                '--normal-border': 'var(--border)',
            } as CSSProperties}
            toastOptions={{
                duration: 5000,
                classNames: {
                    toast: 'rounded-none! font-sans! shadow-md!',
                    title: 'font-semibold! tracking-wide!',
                    description: 'text-muted-foreground! leading-relaxed!',
                    actionButton: 'rounded-none! cursor-pointer! text-xs! font-semibold! uppercase! tracking-widest!',
                    cancelButton: 'rounded-none! cursor-pointer! text-xs! font-semibold! uppercase! tracking-widest!',
                    closeButton: 'cursor-pointer! focus-visible:ring-2! focus-visible:ring-ring!',
                    error: 'border-destructive/40! [&_[data-icon]]:text-destructive!',
                    info: '[&_[data-icon]]:text-primary!',
                    warning: '[&_[data-icon]]:text-amber-600! dark:[&_[data-icon]]:text-amber-400!',
                    success: '[&_[data-icon]]:text-emerald-600! dark:[&_[data-icon]]:text-emerald-400!',
                },
                actionButtonStyle: {
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                },
                cancelButtonStyle: {
                    background: 'var(--secondary)',
                    color: 'var(--secondary-foreground)',
                },
            }}
        />
    )
}
