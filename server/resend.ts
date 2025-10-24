import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email};
}

export async function getUncachableResendClient() {
  const {apiKey, fromEmail} = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail: fromEmail || 'onboarding@resend.dev'
  };
}

export async function sendMagicLinkEmail(email: string, token: string) {
  const magicLink = `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'http://localhost:5000'}/auth/verify?token=${token}`;

  // Always log the magic link for debugging
  console.log('\n' + '='.repeat(80));
  console.log('🔐 MAGIC LINK');
  console.log('='.repeat(80));
  console.log(`📧 To: ${email}`);
  console.log(`🔗 Link: ${magicLink}`);
  console.log('='.repeat(80) + '\n');

  // Send actual email via Resend
  const { client, fromEmail } = await getUncachableResendClient();

  const { data, error } = await client.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Sign in to Sebenza Hub',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #79583a;">Sign in to Sebenza Hub</h2>
        <p>Click the link below to sign in to your account:</p>
        <a href="${magicLink}" style="display: inline-block; background-color: #79583a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Sign In
        </a>
        <p style="color: #666; font-size: 14px;">This link will expire in 10 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}
