import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all users
    const users = await base44.asServiceRole.entities.User.list();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(0, 0, 0, 0);

    const remindersSet = [];

    for (const user of users) {
      // Check last completion
      const completions = await base44.asServiceRole.entities.CompletionLog.filter({
        created_by: user.email
      }, '-created_date', 1);

      if (completions.length === 0) continue;

      const lastCompletion = new Date(completions[0].created_date);
      
      // If last completion was more than 2 days ago
      if (lastCompletion < twoDaysAgo) {
        // Send reminder email
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: '🔥 Your streak is at risk!',
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #9333ea;">⏰ Don't Break Your Streak!</h2>
              <p>Hi ${user.full_name || 'there'},</p>
              <p>We noticed you haven't logged any progress in over 2 days. Your consistency streak is at risk!</p>
              
              <div style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">🎯</div>
                <p style="margin: 0; font-size: 18px; font-weight: bold;">Time to get back on track!</p>
              </div>

              <p><strong>Remember:</strong></p>
              <ul>
                <li>🔥 Consistency is the key to success</li>
                <li>⏱️ Small progress is still progress</li>
                <li>💪 Every day counts toward your goals</li>
                <li>🎯 Don't let your hard work go to waste</li>
              </ul>

              <p style="text-align: center; margin: 30px 0;">
                <a href="${Deno.env.get('BASE44_APP_URL') || 'https://your-app-url.com'}" 
                   style="background: #9333ea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                  Continue Your Journey →
                </a>
              </p>

              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Keep building those habits! Your future self will thank you. 🚀
              </p>
            </div>
          `
        });
        
        remindersSet.push(user.email);
      }
    }

    return Response.json({
      message: `Sent ${remindersSet.length} streak reminder emails`,
      users: remindersSet
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});