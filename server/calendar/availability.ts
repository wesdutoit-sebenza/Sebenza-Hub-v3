/**
 * Availability Service
 * 
 * Generates available time slots based on:
 * - Calendar free/busy data
 * - Working hours configuration
 * - Buffer times
 * - Minimum notice periods
 */

import { getCalendarClientForUser } from './google-oauth';
import type { IStorage } from '../storage';

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
 * @param userId - User ID of the calendar owner
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @param config - Availability configuration
 * @param storage - Storage instance
 * @returns Array of available time slots
 */
export async function getAvailableSlots(
  userId: string,
  startDate: Date,
  endDate: Date,
  config: AvailabilityConfig,
  storage: IStorage
): Promise<TimeSlot[]> {
  // Get calendar client for this specific user
  const calendar = await getCalendarClientForUser(userId, storage);
  
  // Get user's calendar email
  const account = await storage.getConnectedAccount(userId, 'google');
  if (!account) {
    throw new Error('Calendar not connected for user');
  }
  
  // Get busy times from Google Calendar using user's credentials
  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      items: [{ id: account.email }],
    }
  });
  
  const busyWindows = response.data.calendars?.[account.email]?.busy?.map(b => ({
    start: b.start as string,
    end: b.end as string,
  })) || [];
  
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
 * @param userIds - User IDs of calendar owners
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @param config - Availability configuration
 * @param storage - Storage instance
 * @returns Array of time slots where ALL calendars are available
 */
export async function getAvailableSlotsMultiple(
  userIds: string[],
  startDate: Date,
  endDate: Date,
  config: AvailabilityConfig,
  storage: IStorage
): Promise<TimeSlot[]> {
  if (userIds.length === 0) {
    return [];
  }
  
  if (userIds.length === 1) {
    return getAvailableSlots(userIds[0], startDate, endDate, config, storage);
  }
  
  // Get all availability for each calendar
  const allAvailability = await Promise.all(
    userIds.map(userId => getAvailableSlots(userId, startDate, endDate, config, storage))
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
 * @param userId - User ID of calendar owner
 * @param slotStart - Proposed slot start time
 * @param slotEnd - Proposed slot end time
 * @param config - Availability configuration
 * @param storage - Storage instance
 * @returns true if slot is available, false otherwise
 */
export async function validateSlot(
  userId: string,
  slotStart: Date,
  slotEnd: Date,
  config: AvailabilityConfig,
  storage: IStorage
): Promise<boolean> {
  // Get calendar client for this specific user
  const calendar = await getCalendarClientForUser(userId, storage);
  const account = await storage.getConnectedAccount(userId, 'google');
  
  if (!account) {
    throw new Error('Calendar not connected for user');
  }
  
  // Check slightly wider window to catch any conflicts
  const checkStart = addMinutes(slotStart, -30);
  const checkEnd = addMinutes(slotEnd, 30);
  
  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: checkStart.toISOString(),
      timeMax: checkEnd.toISOString(),
      items: [{ id: account.email }],
    }
  });
  
  const busyWindows = response.data.calendars?.[account.email]?.busy?.map(b => ({
    start: b.start as string,
    end: b.end as string,
  })) || [];
  
  const slot = { start: slotStart, end: slotEnd };
  
  return !overlapsWithBusy(
    slot,
    busyWindows,
    config.bufferMinsBefore,
    config.bufferMinsAfter
  );
}
