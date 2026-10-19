import { useEffect, useId, useMemo } from 'react'
import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox'
import { useInfiniteQuery } from '@tanstack/react-query'
import { CalendarDays, Check, Circle, LoaderCircle, X } from 'lucide-react'
import { useGoogleCalendarStore } from '@/app/google-calendar-store'
import {
    Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent,
    ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxTrigger, ComboboxValue,
    useComboboxAnchor,
} from '@/components/ui/combobox'
import { googleCalendarsQueryOptions } from '@/lib/google-calendar'
import type { GoogleCalendar } from '@/lib/google-calendar'

function calendarLabel(calendar: GoogleCalendar) {
    return calendar.summaryOverride || calendar.summary || calendar.id
}

function sameCalendar(item: GoogleCalendar, value: GoogleCalendar) {
    return item.id === value.id
}

function CalendarAvailabilityIcon({ id, availableCalendarsById, isBusy, canMarkMissing }: {
    id: string
    availableCalendarsById: ReadonlyMap<string, GoogleCalendar>
    isBusy: boolean
    canMarkMissing: boolean
}) {
    let Icon = Circle
    let label = 'Availability not checked'
    let className = 'size-3.5 text-muted-foreground'

    if (availableCalendarsById.has(id)) {
        Icon = Check
        label = 'Found in the calendar list'
        className = 'size-3.5 text-emerald-700 dark:text-emerald-400'
    } else if (isBusy) {
        Icon = LoaderCircle
        label = 'Checking availability'
        className = 'size-3.5 animate-spin motion-reduce:animate-none'
    } else if (canMarkMissing) {
        Icon = X
        label = 'Not found in loaded calendars'
        className = 'size-3.5 text-destructive'
    }

    return (
        <span className="inline-flex shrink-0 items-center" title={label}>
            <Icon className={className} aria-hidden="true" />
            <span className="sr-only">{label}</span>
        </span>
    )
}

function CalendarStatusLine({ inputId, isAuthorized, hasSelection, isBusy, isPaused, isError, hasData }: {
    inputId: string
    isAuthorized: boolean
    hasSelection: boolean
    isBusy: boolean
    isPaused: boolean
    isError: boolean
    hasData: boolean
}) {
    let caption: string
    let Icon = CalendarDays
    let iconClassName = 'size-4'

    if (isAuthorized) {
        if (isBusy) {
            Icon = LoaderCircle
            iconClassName = 'size-4 animate-spin motion-reduce:animate-none'
        } else if (isError) {
            Icon = X
            iconClassName = 'size-4 text-destructive'
        } else if (hasData) {
            Icon = Check
            iconClassName = 'size-4 text-emerald-700 dark:text-emerald-400'
        }

        if (isPaused) caption = 'Waiting for a connection…'
        else if (isBusy) caption = 'Loading calendars…'
        else if (isError) caption = 'Could not load calendars. Reload the page to try again.'
        else caption = 'Calendars to display:'
    } else {
        if (hasSelection) {
            caption = 'Connect Google Calendar to check saved selections and choose calendars to display.'
        } else {
            caption = 'Connect Google Calendar to choose calendars to display.'
        }
        Icon = X
        iconClassName = 'size-4 text-destructive'
    }

    return (
        <ComboboxPrimitive.Status>
            <label htmlFor={inputId} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="size-4 shrink-0">
                    <Icon className={iconClassName} aria-hidden="true" />
                </span>
                <span>{caption}</span>
            </label>
        </ComboboxPrimitive.Status>
    )
}

export function GoogleCalendarList() {
    const authorization = useGoogleCalendarStore((state) => state.authorization)
    const inputId = useId()
    const anchor = useComboboxAnchor()
    const selectedCalendars = useGoogleCalendarStore((state) => state.selectedCalendars)
    const setSelectedCalendars = useGoogleCalendarStore((state) => state.setSelectedCalendars)
    const calendarsQuery = useInfiniteQuery(googleCalendarsQueryOptions(authorization))
    const availableCalendarsById = useMemo(() => {
        const byId = new Map<string, GoogleCalendar>()
        for (const page of calendarsQuery.data?.pages ?? []) {
            for (const calendar of page.items ?? []) byId.set(calendar.id, calendar)
        }
        return byId
    }, [calendarsQuery.data])

    const calendars = useMemo(() => {
        // Selected records retain their labels even before their page has loaded.
        const calendars = [...availableCalendarsById.values()]
        for (const calendar of selectedCalendars) {
            if (!availableCalendarsById.has(calendar.id)) calendars.push(calendar)
        }
        return calendars
    }, [availableCalendarsById, selectedCalendars])

    // Publish each page as it arrives, then continue until every calendar is loaded.
    useEffect(() => {
        if (calendarsQuery.data && calendarsQuery.hasNextPage && !calendarsQuery.isFetching &&
            !calendarsQuery.isPaused && !calendarsQuery.isError) {
            void calendarsQuery.fetchNextPage({ cancelRefetch: false })
        }
    })

    const isBusy = authorization !== null && (calendarsQuery.isFetching || calendarsQuery.isPaused ||
        calendarsQuery.isPending || (calendarsQuery.hasNextPage && !calendarsQuery.isError))
    const canMarkMissing = !!calendarsQuery.data && calendarsQuery.isSuccess && !calendarsQuery.hasNextPage && !calendarsQuery.isPaused

    return (
        <div className="max-w-md space-y-3">
            <CalendarStatusLine
                inputId={inputId}
                isAuthorized={authorization !== null}
                hasSelection={selectedCalendars.length > 0}
                isBusy={isBusy}
                isPaused={calendarsQuery.isPaused}
                isError={calendarsQuery.isError}
                hasData={calendarsQuery.data !== undefined}
            />
            <Combobox
                multiple
                disabled={!authorization || calendarsQuery.isError}
                items={calendars}
                value={selectedCalendars}
                onValueChange={(values) => setSelectedCalendars(values.map((calendar) =>
                    availableCalendarsById.get(calendar.id) ?? calendar))}
                itemToStringLabel={calendarLabel}
                itemToStringValue={(calendar) => calendar.id}
                isItemEqualToValue={sameCalendar}
            >
                <ComboboxChips ref={anchor} className={!authorization ? 'opacity-50' : undefined}>
                    <ComboboxValue>
                        {(values: GoogleCalendar[]) => values.map((calendar) => (
                            <ComboboxChip key={calendar.id}>
                                <CalendarAvailabilityIcon
                                    id={calendar.id}
                                    availableCalendarsById={availableCalendarsById}
                                    isBusy={isBusy}
                                    canMarkMissing={canMarkMissing}
                                />
                                {calendarLabel(availableCalendarsById.get(calendar.id) ?? calendar)}
                            </ComboboxChip>
                        ))}
                    </ComboboxValue>
                    <ComboboxChipsInput
                        id={inputId}
                        aria-label="Calendars to display"
                        placeholder="Search calendars…"
                    />
                    <ComboboxTrigger aria-label="Show calendars" className="ml-auto" />
                </ComboboxChips>
                <ComboboxContent anchor={anchor} className="flex flex-col">
                    {!calendarsQuery.isPending && !isBusy && !calendarsQuery.isError && (
                        <ComboboxEmpty>
                            {calendars.length === 0 ? 'No calendars available.' : 'No matching calendars.'}
                        </ComboboxEmpty>
                    )}
                    <ComboboxList
                        className="min-h-0 flex-1"
                        aria-busy={isBusy || undefined}
                    >
                        {(calendar: GoogleCalendar) => (
                            <ComboboxItem key={calendar.id} value={calendar}>
                                <CalendarAvailabilityIcon
                                    id={calendar.id}
                                    availableCalendarsById={availableCalendarsById}
                                    isBusy={isBusy}
                                    canMarkMissing={canMarkMissing}
                                />
                                <span
                                    aria-hidden="true"
                                    className="size-3 shrink-0 rounded-full border bg-muted"
                                    style={{ backgroundColor: calendar.backgroundColor }}
                                />
                                <span className="min-w-0 wrap-break-word">{calendarLabel(calendar)}</span>
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </div>
    )
}
