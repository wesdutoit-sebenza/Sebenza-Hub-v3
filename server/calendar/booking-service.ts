/**
 * Interview Booking Service
 * 
 * High-level service for managing interview bookings:
 * - Check availability
 * - Create interviews with calendar events
 * - Reschedule/cancel interviews
 * - Send notifications
 */

import { getCalendarClientForUser } from './google-oauth';
import { createEventWithMeet, updateEvent, cancelEvent } from './google-calendar';
import { getAvailableSlots, validateSlot, type WorkingHours, type TimeSlot } from './availability';
import type { IStorage } from '../storage';
import type { InsertInterview, Interview } from '@shared/schema';

export interface BookingRequest {
  organizationId: string;
  interviewerUserId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  jobId?: string;
  poolId?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  timezone?: string;
}

export interface AvailabilityRequest {
  interviewerUserId: string;
  startDate: Date;
  endDate: Date;
  workingHours?: WorkingHours;
  slotInterval?: number;
  meetingDuration?: number;
  bufferMinsBefore?: number;
  bufferMinsAfter?: number;
  minNoticeHours?: number;
}

/**
 * Get available interview slots for an interviewer
 */
export async function getInterviewAvailability(
  request: AvailabilityRequest,
  storage: IStorage
): Promise<TimeSlot[]> {
  // Get interviewer's connected calendar
  const account = await storage.getConnectedAccount(request.interviewerUserId, 'google');
  
  if (!account) {
    throw new Error('Interviewer has not connected their Google Calendar');
  }
  
  // Default configuration
  const config = {
    workingHours: request.workingHours || {
      start: 9,
      end: 17,
      days: [1, 2, 3, 4, 5], // Monday-Friday
      timezone: 'Africa/Johannesburg',
    },
    slotInterval: request.slotInterval || 30,
    meetingDuration: request.meetingDuration || 60,
    bufferMinsBefore: request.bufferMinsBefore || 15,
    bufferMinsAfter: request.bufferMinsAfter || 15,
    minNoticeHours: request.minNoticeHours || 24,
  };
  
  // Get available slots from Google Calendar using the interviewer's credentials
  const slots = await getAvailableSlots(
    request.interviewerUserId,
    request.startDate,
    request.endDate,
    config,
    storage
  );
  
  return slots;
}

/**
 * Book an interview
 * 
 * 1. Validates slot is still available
 * 2. Creates Google Calendar event with Meet link
 * 3. Saves interview to database
 * 4. Returns interview with meeting link
 */
export async function bookInterview(
  request: BookingRequest,
  storage: IStorage
): Promise<Interview> {
  // Get interviewer's connected calendar
  const account = await storage.getConnectedAccount(request.interviewerUserId, 'google');
  
  if (!account) {
    throw new Error('Interviewer has not connected their Google Calendar');
  }
  
  // Validate slot is still available (prevents double-booking)
  const config = {
    workingHours: {
      start: 9,
      end: 17,
      days: [1, 2, 3, 4, 5],
      timezone: request.timezone || 'Africa/Johannesburg',
    },
    slotInterval: 30,
    meetingDuration: 60,
    bufferMinsBefore: 15,
    bufferMinsAfter: 15,
    minNoticeHours: 24,
  };
  
  const isAvailable = await validateSlot(
    request.interviewerUserId,
    request.startTime,
    request.endTime,
    config,
    storage
  );
  
  if (!isAvailable) {
    throw new Error('This time slot is no longer available');
  }
  
  // Create Google Calendar event with Meet link
  // Note: We need to use the interviewer's OAuth token
  const calendar = await getCalendarClientForUser(request.interviewerUserId, storage);
  
  const calendarEvent = await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    requestBody: {
      summary: request.title,
      description: request.description,
      start: {
        dateTime: request.startTime.toISOString(),
        timeZone: request.timezone || 'Africa/Johannesburg',
      },
      end: {
        dateTime: request.endTime.toISOString(),
        timeZone: request.timezone || 'Africa/Johannesburg',
      },
      attendees: [
        { email: request.candidateEmail },
        { email: account.email }, // Interviewer
      ],
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day
          { method: 'popup', minutes: 30 },
        ],
      },
    },
  });
  
  const eventId = calendarEvent.data.id;
  const meetingLink = calendarEvent.data.hangoutLink || calendarEvent.data.conferenceData?.entryPoints?.[0]?.uri;
  
  if (!eventId) {
    throw new Error('Failed to create calendar event');
  }
  
  // Save interview to database
  const interview = await storage.createInterview({
    organizationId: request.organizationId,
    poolId: request.poolId || null,
    jobId: request.jobId || null,
    candidateUserId: null, // Could link if candidate is registered
    candidateName: request.candidateName,
    candidateEmail: request.candidateEmail,
    candidatePhone: request.candidatePhone || null,
    interviewerUserId: request.interviewerUserId,
    title: request.title,
    description: request.description || null,
    startTime: request.startTime,
    endTime: request.endTime,
    timezone: request.timezone || 'Africa/Johannesburg',
    provider: 'google',
    providerEventId: eventId,
    meetingJoinUrl: meetingLink || null,
    location: null,
    status: 'scheduled',
    reminderSent: 0,
    feedback: null,
  });
  
  return interview;
}

/**
 * Reschedule an interview
 */
export async function rescheduleInterview(
  interviewId: string,
  newStartTime: Date,
  newEndTime: Date,
  storage: IStorage
): Promise<Interview> {
  const interview = await storage.getInterview(interviewId);
  
  if (!interview) {
    throw new Error('Interview not found');
  }
  
  if (interview.status === 'cancelled') {
    throw new Error('Cannot reschedule a cancelled interview');
  }
  
  // Validate new slot is available
  const account = await storage.getConnectedAccount(interview.interviewerUserId, 'google');
  
  if (!account) {
    throw new Error('Interviewer calendar not connected');
  }
  
  const config = {
    workingHours: {
      start: 9,
      end: 17,
      days: [1, 2, 3, 4, 5],
      timezone: interview.timezone || 'Africa/Johannesburg',
    },
    slotInterval: 30,
    meetingDuration: 60,
    bufferMinsBefore: 15,
    bufferMinsAfter: 15,
    minNoticeHours: 2, // Less strict for rescheduling
  };
  
  const isAvailable = await validateSlot(
    interview.interviewerUserId,
    newStartTime,
    newEndTime,
    config,
    storage
  );
  
  if (!isAvailable) {
    throw new Error('New time slot is not available');
  }
  
  // Update Google Calendar event
  if (interview.providerEventId) {
    const calendar = await getCalendarClientForUser(interview.interviewerUserId, storage);
    
    await calendar.events.patch({
      calendarId: 'primary',
      eventId: interview.providerEventId,
      requestBody: {
        start: {
          dateTime: newStartTime.toISOString(),
          timeZone: interview.timezone || 'Africa/Johannesburg',
        },
        end: {
          dateTime: newEndTime.toISOString(),
          timeZone: interview.timezone || 'Africa/Johannesburg',
        },
      },
    });
  }
  
  // Update database
  await storage.updateInterview(interviewId, {
    startTime: newStartTime,
    endTime: newEndTime,
    status: 'rescheduled',
  });
  
  const updated = await storage.getInterview(interviewId);
  return updated!;
}

/**
 * Cancel an interview
 */
export async function cancelInterview(
  interviewId: string,
  storage: IStorage
): Promise<void> {
  const interview = await storage.getInterview(interviewId);
  
  if (!interview) {
    throw new Error('Interview not found');
  }
  
  if (interview.status === 'cancelled') {
    return; // Already cancelled
  }
  
  // Cancel Google Calendar event
  if (interview.providerEventId) {
    try {
      const calendar = await getCalendarClientForUser(interview.interviewerUserId, storage);
      
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: interview.providerEventId,
        sendUpdates: 'all', // Notify all attendees
      });
    } catch (err) {
      console.error('Failed to delete calendar event:', err);
      // Continue to mark as cancelled in DB even if calendar delete fails
    }
  }
  
  // Update database
  await storage.updateInterview(interviewId, {
    status: 'cancelled',
  });
}
