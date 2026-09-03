import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { routineTitle, description, date, duration } = await req.json();

    // Get Google Calendar access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');

    // Create calendar event
    const startTime = new Date(date);
    const endTime = new Date(startTime.getTime() + (duration || 30) * 60000);

    const event = {
      summary: `🎯 ${routineTitle}`,
      description: description || 'Routine Quest daily routine',
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'UTC',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Calendar API error: ${error}`);
    }

    const result = await response.json();

    return Response.json({ 
      success: true, 
      eventId: result.id,
      link: result.htmlLink 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});