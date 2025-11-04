/**
 * Availability Service
 * 
 * Generates available time slots based on:
 * - Calendar free/busy data
 * - Working hours configuration
 * - Buffer times
 * - Minimum notice periods
 */

import { getFreeBusy } from './google-calendar';

export interface WorkingHours {
  start: number; // Hour (0-23)
  end: number; // Hour (0-23)
  days: number[]; // Days of week (0=Sunday, 1=Monday, etc.)
  timezone: string;
}

export interface AvailabilityConfig {
  workingHours: WorkingHours;
  slotInterval: number; // Minutes between slot starts
  meetingDuration: number; // Minutes per meeting
  bufferMinsBefore: number;
  bufferMinsAfter: number;
  minNoticeHours: number;
}

export interface TimeSlot {
  start: Date;
  end: Date;
}

/**
 * Add minutes to a date
 */
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

/**
 * Check if a date falls within working hours
 */
function isWithinWorkingHours(date: Date, workingHours: WorkingHours): boolean {
  const day = date.getDay(); // 0 = Sunday
  const hour = date.getHours();
  
  if (!workingHours.days.includes(day)) {
    return false;
  }
  
  return hour >= workingHours.start && hour < workingHours.end;
}

/**
 * Check if a time slot overlaps with any busy windows
 */
function overlapsWithBusy(
  slot: TimeSlot,
  busyWindows: { start: string; end: string }[],
  bufferMinsBefore: number,
  bufferMinsAfter: number
): boolean {
  for (const busy of busyWindows) {
    const busyStart = new Date(busy.start);
    const busyEnd = new Date(busy.end);
    
    // Apply buffers to busy window
    const bufferedStart = addMinutes(busyStart, -bufferMinsBefore);
    const bufferedEnd = addMinutes(busyEnd, bufferMinsAfter);
    
    // Check for overlap
    if (slot.start < bufferedEnd && slot.end > bufferedStart) {
      return true;
    }
  }
  
  return false;
}

/**
 * Generate available time slots for a single day
 */
function generateSlotsForDay(
  day: Date,
  config: AvailabilityConfig,
  busyWindows: { start: string; end: string }[]
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  // Set up start and end of working day
  const dayStart = new Date(day);
  dayStart.setHours(config.workingHours.start, 0, 0, 0);
  
  const dayEnd = new Date(day);
  dayEnd.setHours(config.workingHours.end, 0, 0, 0);
  
  // Don't generate slots for past times
  const now = new Date();
  const earliestStart = addMinutes(now, config.minNoticeHours * 60);
  
  // Generate slots at intervals
  let current = new Date(dayStart);
  
  while (current < dayEnd) {
    const slotStart = new Date(current);
    const slotEnd = addMinutes(slotStart, config.meetingDuration);
    
    // Check if slot is valid
    if (slotEnd <= dayEnd && // Doesn't exceed working hours
        slotStart >= earliestStart && // Respects minimum notice
        isWithinWorkingHours(slotStart, config.workingHours) &&
        !overlapsWithBusy(
          { start: slotStart, end: slotEnd },
          busyWindows,
          config.bufferMinsBefore,
          config.bufferMinsAfter
        )) {
      slots.push({ start: slotStart, end: slotEnd });
    }
    
    current = addMinutes(current, config.slotInterval);
  }
  
  return slots;
}

/**
 * Get available time slots for a single calendar
 * 
 * @param email - Calendar email to check
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @param config - Availability configuration
 * @returns Array of available time slots
 */
export async function getAvailableSlots(
  email: string,
  startDate: Date,
  endDate: Date,
  config: AvailabilityConfig
): Promise<TimeSlot[]> {
  // Get busy times from Google Calendar
  const busyData = await getFreeBusy(
    [email],
    startDate.toISOString(),
    endDate.toISOString()
  );
  
  const busyWindows = busyData[email] || [];
  
  // Generate slots for each day in range
  const allSlots: TimeSlot[] = [];
  let current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  while (current <= end) {
    const daySlots = generateSlotsForDay(current, config, busyWindows);
    allSlots.push(...daySlots);
    
    // Move to next day
    current = new Date(current);
    current.setDate(current.getDate() + 1);
  }
  
  return allSlots;
}

/**
 * Get available slots for multiple calendars (intersection)
 * For panel interviews where multiple interviewers must be available
 * 
 * @param emails - Calendar emails to check
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @param config - Availability configuration
 * @returns Array of time slots where ALL calendars are available
 */
export async function getAvailableSlotsMultiple(
  emails: string[],
  startDate: Date,
  endDate: Date,
  config: AvailabilityConfig
): Promise<TimeSlot[]> {
  if (emails.length === 0) {
    return [];
  }
  
  if (emails.length === 1) {
    return getAvailableSlots(emails[0], startDate, endDate, config);
  }
  
  // Get all availability for each calendar
  const allAvailability = await Promise.all(
    emails.map(email => getAvailableSlots(email, startDate, endDate, config))
  );
  
  // Find intersection: slots available for ALL calendars
  const firstCalendarSlots = allAvailability[0];
  const intersection: TimeSlot[] = [];
  
  for (const slot of firstCalendarSlots) {
    // Check if this slot exists in all other calendars
    const availableInAll = allAvailability.slice(1).every(calendarSlots => {
      return calendarSlots.some(s => 
        s.start.getTime() === slot.start.getTime() &&
        s.end.getTime() === slot.end.getTime()
      );
    });
    
    if (availableInAll) {
      intersection.push(slot);
    }
  }
  
  return intersection;
}

/**
 * Validate that a specific time slot is still available
 * Call this right before booking to prevent double-bookings
 * 
 * @param email - Calendar email
 * @param slotStart - Proposed slot start time
 * @param slotEnd - Proposed slot end time
 * @param config - Availability configuration
 * @returns true if slot is available, false otherwise
 */
export async function validateSlot(
  email: string,
  slotStart: Date,
  slotEnd: Date,
  config: AvailabilityConfig
): Promise<boolean> {
  // Check slightly wider window to catch any conflicts
  const checkStart = addMinutes(slotStart, -30);
  const checkEnd = addMinutes(slotEnd, 30);
  
  const busyData = await getFreeBusy(
    [email],
    checkStart.toISOString(),
    checkEnd.toISOString()
  );
  
  const busyWindows = busyData[email] || [];
  
  const slot = { start: slotStart, end: slotEnd };
  
  return !overlapsWithBusy(
    slot,
    busyWindows,
    config.bufferMinsBefore,
    config.bufferMinsAfter
  );
}
