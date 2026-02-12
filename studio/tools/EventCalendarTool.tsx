import {Badge, Box, Button, Card, Flex, Grid, Spinner, Stack, Text} from '@sanity/ui'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {useClient} from 'sanity'

type VenueKey = 'fleda' | 'fraktal' | 'bar' | 'galerie'

type EventDoc = {
  _id: string
  _updatedAt?: string
  title?: string
  programDate?: string
  programTime?: string
  venue?: VenueKey
  confirmed?: boolean
}

type CalendarEvent = {
  id: string
  title: string
  date: string
  time: string
  venue: VenueKey
  confirmed: boolean
  updatedAt: string
}

const EVENT_QUERY = `*[_type == "event" && defined(programDate)] | order(programDate asc, programTime asc) {
  _id,
  _updatedAt,
  title,
  programDate,
  programTime,
  venue,
  confirmed
}`

const WEEKDAY_LABELS = ['Po', 'Ut', 'St', 'Ct', 'Pa', 'So', 'Ne']
const MONTH_LABELS = ['Leden', 'Unor', 'Brezen', 'Duben', 'Kveten', 'Cerven', 'Cervenec', 'Srpen', 'Zari', 'Rijen', 'Listopad', 'Prosinec']

const VENUE_LABELS: Record<VenueKey, string> = {
  fleda: 'Fleda',
  fraktal: 'Fraktal',
  bar: 'Spektrum bar',
  galerie: 'Spektrum galerie',
}

const VENUE_COLORS: Record<VenueKey, string> = {
  fleda: '#f97316',
  fraktal: '#2f5bff',
  bar: '#ff9ff5',
  galerie: '#a3f730',
}

const VENUE_TEXT_COLORS: Record<VenueKey, string> = {
  fleda: '#111827',
  fraktal: '#ffffff',
  bar: '#111827',
  galerie: '#111827',
}

function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function toMonthKey(date: Date): string {
  return toDateKey(date).slice(0, 7)
}

function monthLabel(date: Date): string {
  return `${MONTH_LABELS[date.getMonth()] || 'Mesic'} ${date.getFullYear()}`
}

function fromDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number)
  if (!y || !m || !d) {
    return new Date()
  }
  return new Date(y, m - 1, d)
}

function formatSelectedDate(dateKey: string): string {
  const date = fromDateKey(dateKey)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

function getMonthCells(monthDate: Date): Array<Date | null> {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = (firstDay.getDay() + 6) % 7

  const cells: Array<Date | null> = []

  for (let i = 0; i < startOffset; i += 1) {
    cells.push(null)
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day))
  }

  while (cells.length < 42) {
    cells.push(null)
  }

  return cells
}

function stripDraftPrefix(id: string): string {
  return id.startsWith('drafts.') ? id.slice(7) : id
}

function normalizeEvents(rawEvents: EventDoc[]): CalendarEvent[] {
  const bestByCanonicalId = new Map<string, EventDoc>()

  for (const event of rawEvents) {
    if (!event._id || !event.programDate || !event.venue) continue

    const canonicalId = stripDraftPrefix(event._id)
    const existing = bestByCanonicalId.get(canonicalId)

    if (!existing) {
      bestByCanonicalId.set(canonicalId, event)
      continue
    }

    const nextIsDraft = event._id.startsWith('drafts.')
    const existingIsDraft = existing._id.startsWith('drafts.')

    if (nextIsDraft && !existingIsDraft) {
      bestByCanonicalId.set(canonicalId, event)
      continue
    }

    if (nextIsDraft === existingIsDraft) {
      const existingUpdated = existing._updatedAt || ''
      const nextUpdated = event._updatedAt || ''
      if (nextUpdated > existingUpdated) {
        bestByCanonicalId.set(canonicalId, event)
      }
    }
  }

  return Array.from(bestByCanonicalId.values())
    .map((event) => ({
      id: event._id,
      title: event.title || 'Untitled event',
      date: event.programDate || '',
      time: event.programTime || '',
      venue: event.venue as VenueKey,
      confirmed: Boolean(event.confirmed),
      updatedAt: event._updatedAt || '',
    }))
    .filter((event) => /^\d{4}-\d{2}-\d{2}$/.test(event.date))
    .sort((a, b) => `${a.date}T${a.time || '00:00'}`.localeCompare(`${b.date}T${b.time || '00:00'}`))
}

export default function EventCalendarTool() {
  const client = useClient({apiVersion: '2023-10-01'})

  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [showOnlyConfirmed, setShowOnlyConfirmed] = useState(false)

  const today = useMemo(() => new Date(), [])
  const todayKey = useMemo(() => toDateKey(today), [today])

  const [activeMonth, setActiveMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(today))

  const loadEvents = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const raw = await client.withConfig({perspective: 'raw'}).fetch<EventDoc[]>(EVENT_QUERY)
      setEvents(normalizeEvents(raw))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load events'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }, [client])

  useEffect(() => {
    void loadEvents()
  }, [loadEvents])

  const visibleEvents = useMemo(
    () => (showOnlyConfirmed ? events.filter((event) => event.confirmed) : events),
    [events, showOnlyConfirmed]
  )

  const eventsByDate = useMemo(() => {
    const byDate = new Map<string, CalendarEvent[]>()
    for (const event of visibleEvents) {
      const list = byDate.get(event.date) || []
      list.push(event)
      byDate.set(event.date, list)
    }
    return byDate
  }, [visibleEvents])

  const activeMonthKey = toMonthKey(activeMonth)
  const monthCells = useMemo(() => getMonthCells(activeMonth), [activeMonth])

  useEffect(() => {
    if (!selectedDate.startsWith(activeMonthKey)) {
      setSelectedDate(toDateKey(activeMonth))
    }
  }, [activeMonth, activeMonthKey, selectedDate])

  const selectedDayEvents = useMemo(() => {
    return (eventsByDate.get(selectedDate) || []).slice().sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'))
  }, [eventsByDate, selectedDate])

  const goToMonth = (offset: number) => {
    const nextMonth = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + offset, 1)
    setActiveMonth(nextMonth)
    setSelectedDate(toDateKey(nextMonth))
  }

  return (
    <Card padding={4} tone="transparent" style={{height: '100%', overflow: 'auto'}}>
      <Stack space={4}>
        <Flex align="center" justify="space-between" gap={3} wrap="wrap">
          <Flex align="center" gap={2}>
            <Button
              text="<"
              mode="ghost"
              onClick={() => goToMonth(-1)}
              aria-label="Previous month"
            />
            <Text size={3} weight="semibold">
              {monthLabel(activeMonth)}
            </Text>
            <Button
              text=">"
              mode="ghost"
              onClick={() => goToMonth(1)}
              aria-label="Next month"
            />
          </Flex>

          <Flex align="center" gap={2}>
            <Button
              mode={showOnlyConfirmed ? 'default' : 'bleed'}
              text="Confirmed only"
              onClick={() => setShowOnlyConfirmed((prev) => !prev)}
            />
            <Button mode="bleed" text="Refresh" onClick={() => void loadEvents()} />
          </Flex>
        </Flex>

        {isLoading && (
          <Flex align="center" gap={3} paddingY={5}>
            <Spinner muted />
            <Text size={1} muted>
              Loading events...
            </Text>
          </Flex>
        )}

        {!isLoading && errorMessage && (
          <Card padding={3} tone="critical" radius={2}>
            <Text size={1}>Failed to load events: {errorMessage}</Text>
          </Card>
        )}

        {!isLoading && !errorMessage && (
          <Grid columns={[1, 1, 2]} gap={4}>
            <Card padding={3} radius={2} shadow={1} border>
              <Stack space={3}>
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                    gap: '6px',
                  }}
                >
                  {WEEKDAY_LABELS.map((label) => (
                    <Text key={label} size={1} muted style={{textAlign: 'center'}}>
                      {label}
                    </Text>
                  ))}
                </Box>

                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                    gap: '6px',
                  }}
                >
                  {monthCells.map((cellDate, index) => {
                    if (!cellDate) {
                      return <Box key={`empty-${index}`} style={{minHeight: '84px'}} />
                    }

                    const key = toDateKey(cellDate)
                    const dayEvents = eventsByDate.get(key) || []
                    const previewEvents = dayEvents.slice(0, 2)
                    const isSelected = key === selectedDate
                    const isToday = key === todayKey
                    const borderColor = isSelected || isToday ? '#3b82f6' : 'var(--card-border-color)'

                    return (
                      <Card
                        key={key}
                        padding={2}
                        radius={3}
                        shadow={0}
                        tone="default"
                        onClick={() => setSelectedDate(key)}
                        style={{
                          minHeight: '84px',
                          cursor: 'pointer',
                          border: `1px solid ${borderColor}`,
                          borderRadius: '10px',
                          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : undefined,
                        }}
                      >
                        <Stack space={2}>
                          <Flex align="center" justify="space-between">
                            <Text size={1} weight="semibold">
                              {cellDate.getDate()}
                            </Text>
                            {dayEvents.length > 0 && <Badge tone="primary">{dayEvents.length}</Badge>}
                          </Flex>

                          <Stack space={1}>
                            {previewEvents.map((event) => (
                              <Box
                                key={`${key}-${event.id}`}
                                style={{
                                  borderRadius: '9999px',
                                  border: '1px solid #00000033',
                                  backgroundColor: VENUE_COLORS[event.venue],
                                  color: VENUE_TEXT_COLORS[event.venue],
                                  fontSize: '11px',
                                  lineHeight: 1.2,
                                  padding: '2px 7px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                                title={`${event.time || 'all-day'} - ${event.title}`}
                              >
                                {event.title}
                              </Box>
                            ))}
                            {dayEvents.length > previewEvents.length && (
                              <Text size={0} muted>
                                +{dayEvents.length - previewEvents.length} more
                              </Text>
                            )}
                          </Stack>
                        </Stack>
                      </Card>
                    )
                  })}
                </Box>

                <Card padding={3} radius={2} border tone="transparent">
                  <Stack space={2}>
                    <Text size={1} muted>
                      Venue:
                    </Text>

                    <Flex align="center" gap={3} wrap="wrap">
                      {(['fleda', 'fraktal', 'bar', 'galerie'] as VenueKey[]).map((venue) => (
                        <Flex key={venue} align="center" gap={2}>
                          <Box
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '9999px',
                              border: '1px solid #00000033',
                              backgroundColor: VENUE_COLORS[venue],
                            }}
                          />
                          <Text size={1}>{VENUE_LABELS[venue]}</Text>
                        </Flex>
                      ))}
                    </Flex>
                  </Stack>
                </Card>
              </Stack>
            </Card>

            <Card padding={3} radius={2} shadow={1} border>
              <Stack space={3}>
                <Text size={2} weight="semibold">
                  {formatSelectedDate(selectedDate)}
                </Text>

                {selectedDayEvents.length === 0 && (
                  <Text size={1} muted>
                    No events on this date.
                  </Text>
                )}

                {selectedDayEvents.map((event) => {
                  const intentHref = `/intent/edit/id=${encodeURIComponent(event.id)};type=event`
                  return (
                    <Card key={event.id} padding={3} radius={2} border>
                      <Stack space={2}>
                        <Flex align="center" justify="space-between" gap={2}>
                          <Text size={1} weight="semibold">
                            {event.title}
                          </Text>
                          <Badge tone={event.confirmed ? 'positive' : 'caution'}>
                            {event.confirmed ? 'Confirmed' : 'Needs confirm'}
                          </Badge>
                        </Flex>

                        <Flex align="center" gap={2} wrap="wrap">
                          <Badge>{event.time || 'all-day'}</Badge>
                          <Badge tone="primary">{VENUE_LABELS[event.venue]}</Badge>
                        </Flex>

                        <a href={intentHref}>Open event</a>
                      </Stack>
                    </Card>
                  )
                })}
              </Stack>
            </Card>
          </Grid>
        )}
      </Stack>
    </Card>
  )
}
