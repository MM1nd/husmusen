import { Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'

export function AppLayout() {
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
            <Outlet />
        </main>
    )
}
