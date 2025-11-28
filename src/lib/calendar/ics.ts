/**
 * ICS calendar file generation for delivery events.
 * Creates downloadable .ics files for adding delivery dates to calendars.
 */

/**
 * Formats a Date object to ICS datetime format (YYYYMMDDTHHMMSS)
 * Uses local timezone
 * 
 * @param date - Date to format
 * @returns ICS formatted datetime string
 */
function formatICSDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Generates a unique ID for the ICS event
 * 
 * @param deliveryDate - The delivery date
 * @returns Unique ID string
 */
function generateEventUID(deliveryDate: Date): string {
  const timestamp = deliveryDate.getTime();
  const random = Math.random().toString(36).substring(2, 8);
  return `smakowalo-delivery-${timestamp}-${random}@smakowalo.pl`;
}

/**
 * Escapes special characters for ICS format
 * 
 * @param text - Text to escape
 * @returns Escaped text
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Options for building an ICS delivery event
 */
export interface DeliveryICSOptions {
  deliveryDate: Date;
  planDescription?: string;
  mealsCount?: number;
  address?: string;
  deliveryDay?: 'tuesday' | 'thursday' | string;
}

/**
 * Builds an ICS file content for a Smakowalo delivery event.
 * The event is set for the delivery day from 10:00 to 12:00 (typical delivery window).
 * 
 * @param options - Options for the ICS event
 * @returns ICS file content as string
 */
export function buildDeliveryIcs(options: DeliveryICSOptions): string {
  const { 
    deliveryDate, 
    planDescription, 
    mealsCount,
    address,
    deliveryDay 
  } = options;

  // Set delivery time window (10:00 - 12:00)
  const startTime = new Date(deliveryDate);
  startTime.setHours(10, 0, 0, 0);
  
  const endTime = new Date(deliveryDate);
  endTime.setHours(12, 0, 0, 0);

  // Current timestamp for DTSTAMP
  const now = new Date();

  // Build event title
  const dayName = deliveryDay === 'tuesday' ? 'Wtorek' : 
                  deliveryDay === 'thursday' ? 'Czwartek' : 
                  'Dostawa';
  const title = `Smakowało - Dostawa (${dayName})`;

  // Build description
  let description = 'Dostawa zestawu posiłków Smakowało.';
  if (mealsCount) {
    description += `\\nLiczba posiłków: ${mealsCount}`;
  }
  if (planDescription) {
    description += `\\nPlan: ${escapeICSText(planDescription)}`;
  }
  description += '\\n\\nMiłego gotowania! 🍳';
  description += '\\n\\nSmakowało - zdrowe zestawy posiłków';

  // Build location
  const location = address ? escapeICSText(address) : 'Twój adres dostawy';

  // Generate unique ID
  const uid = generateEventUID(deliveryDate);

  // Build ICS content
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Smakowało//Delivery Calendar//PL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Smakowało Dostawy',
    'X-WR-TIMEZONE:Europe/Warsaw',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(startTime)}`,
    `DTEND:${formatICSDate(endTime)}`,
    `SUMMARY:${escapeICSText(title)}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    // Add reminder 1 day before
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Jutro dostawa Smakowało!',
    'TRIGGER:-P1D',
    'END:VALARM',
    // Add reminder 2 hours before
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Dostawa Smakowało za 2 godziny!',
    'TRIGGER:-PT2H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

/**
 * Builds an ICS file content for the selection deadline reminder.
 * Reminds user to select meals before the deadline.
 * 
 * @param deadlineDate - The selection deadline date
 * @param deliveryDate - The associated delivery date
 * @returns ICS file content as string
 */
export function buildDeadlineReminderIcs(
  deadlineDate: Date,
  deliveryDate: Date
): string {
  const now = new Date();
  
  // Set reminder at 12:00 on the deadline day
  const reminderTime = new Date(deadlineDate);
  reminderTime.setHours(12, 0, 0, 0);
  
  const endTime = new Date(deadlineDate);
  endTime.setHours(13, 0, 0, 0);

  const uid = `smakowalo-deadline-${deadlineDate.getTime()}-${Math.random().toString(36).substring(2, 8)}@smakowalo.pl`;

  const deliveryDateStr = deliveryDate.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  const description = `Ostatni dzień na wybór dań na dostawę ${deliveryDateStr}.\\n\\nWejdź na smakowalo.pl/panel i wybierz swoje dania!\\n\\nJeśli nie wybierzesz, system automatycznie dobierze dania według Twoich preferencji.`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Smakowało//Deadline Reminder//PL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(reminderTime)}`,
    `DTEND:${formatICSDate(endTime)}`,
    `SUMMARY:Smakowało - Ostatni dzień na wybór dań`,
    `DESCRIPTION:${description}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Wybierz dania do swojej dostawy Smakowało!',
    'TRIGGER:-PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

/**
 * Triggers download of an ICS file in the browser
 * 
 * @param icsContent - ICS file content
 * @param filename - Name for the downloaded file
 */
export function downloadIcsFile(icsContent: string, filename: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Helper to generate filename for delivery ICS
 * 
 * @param deliveryDate - The delivery date
 * @returns Filename string
 */
export function getDeliveryIcsFilename(deliveryDate: Date): string {
  const dateStr = deliveryDate.toISOString().split('T')[0];
  return `smakowalo-dostawa-${dateStr}.ics`;
}

/**
 * Combines building and downloading an ICS file for a delivery
 * 
 * @param options - Options for the ICS event
 */
export function downloadDeliveryCalendarEvent(options: DeliveryICSOptions): void {
  const icsContent = buildDeliveryIcs(options);
  const filename = getDeliveryIcsFilename(options.deliveryDate);
  downloadIcsFile(icsContent, filename);
}
