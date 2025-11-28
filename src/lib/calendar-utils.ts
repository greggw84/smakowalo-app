/**
 * Calendar export utilities for subscription deliveries.
 * Generates ICS files and calendar links for Apple, Google, and Outlook calendars.
 */

export interface CalendarEvent {
  title: string
  description: string
  location?: string
  startDate: Date
  endDate?: Date
  allDay?: boolean
}

/**
 * Formats a date for ICS file format (YYYYMMDD or YYYYMMDDTHHmmssZ)
 */
function formatICSDate(date: Date, allDay = false): string {
  if (allDay) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}${month}${day}`
  }
  
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/**
 * Escapes special characters for ICS format
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/**
 * Generates an ICS file content for a calendar event
 */
export function generateICSFile(event: CalendarEvent): string {
  const uid = `smakowalo-${Date.now()}-${Math.random().toString(36).slice(2, 11)}@smakowalo.pl`
  const now = new Date()
  const dtstamp = formatICSDate(now)
  
  const startDate = event.allDay 
    ? formatICSDate(event.startDate, true)
    : formatICSDate(event.startDate)
  
  const endDate = event.endDate 
    ? (event.allDay ? formatICSDate(event.endDate, true) : formatICSDate(event.endDate))
    : startDate

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Smakowało//Meal Subscription//PL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
  ]

  if (event.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${startDate}`)
    lines.push(`DTEND;VALUE=DATE:${endDate}`)
  } else {
    lines.push(`DTSTART:${startDate}`)
    lines.push(`DTEND:${endDate}`)
  }

  lines.push(`SUMMARY:${escapeICSText(event.title)}`)
  
  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICSText(event.description)}`)
  }
  
  if (event.location) {
    lines.push(`LOCATION:${escapeICSText(event.location)}`)
  }

  // Add reminder 1 day before
  lines.push('BEGIN:VALARM')
  lines.push('ACTION:DISPLAY')
  lines.push('DESCRIPTION:Reminder')
  lines.push('TRIGGER:-P1D')
  lines.push('END:VALARM')

  lines.push('END:VEVENT')
  lines.push('END:VCALENDAR')

  return lines.join('\r\n')
}

/**
 * Creates and triggers a download of an ICS file
 */
export function downloadICSFile(event: CalendarEvent, filename?: string): void {
  const icsContent = generateICSFile(event)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `smakowalo-dostawa-${event.startDate.toISOString().split('T')[0]}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generates a Google Calendar event URL
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const formatGoogleDate = (date: Date, allDay = false): string => {
    if (allDay) {
      return date.toISOString().split('T')[0].replace(/-/g, '')
    }
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description || '',
    dates: `${formatGoogleDate(event.startDate, event.allDay)}/${formatGoogleDate(event.endDate || event.startDate, event.allDay)}`,
  })

  if (event.location) {
    params.set('location', event.location)
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Generates an Outlook.com calendar event URL
 */
export function generateOutlookCalendarUrl(event: CalendarEvent): string {
  const formatOutlookDate = (date: Date): string => {
    return date.toISOString()
  }

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    body: event.description || '',
    startdt: formatOutlookDate(event.startDate),
    enddt: formatOutlookDate(event.endDate || event.startDate),
  })

  if (event.location) {
    params.set('location', event.location)
  }

  if (event.allDay) {
    params.set('allday', 'true')
  }

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

/**
 * Creates a calendar event for a Smakowało delivery
 */
export function createDeliveryCalendarEvent(
  deliveryDate: Date, 
  mealsCount: number,
  deliveryDay: string
): CalendarEvent {
  const deliveryDayPolish = deliveryDay === 'tuesday' ? 'wtorek' : 'czwartek'
  
  return {
    title: `🥗 Dostawa Smakowało`,
    description: `Dostawa ${mealsCount} posiłków z Smakowało.\n\nTwoje zamówienie zostanie dostarczone ${deliveryDayPolish}.`,
    startDate: deliveryDate,
    allDay: true,
    location: 'Twój adres dostawy'
  }
}

/**
 * Creates a calendar event for the meal selection deadline
 */
export function createDeadlineCalendarEvent(
  deadlineDate: Date,
  deliveryDate: Date
): CalendarEvent {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pl-PL', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    })
  }

  return {
    title: `⏰ Termin wyboru dań Smakowało`,
    description: `Ostatni dzień na wybór dań na dostawę ${formatDate(deliveryDate)}.\n\nPo tym terminie system automatycznie dobierze dania według Twoich preferencji.`,
    startDate: deadlineDate,
    allDay: false
  }
}

/**
 * Helper to open a calendar URL in a new window
 */
export function openCalendarUrl(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer')
}
