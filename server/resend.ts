import { Resend } from 'resend';

let cachedClient: { client: Resend; fromEmail: string } | null = null;

async function getCredentialsFromConnection() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!hostname || !xReplitToken) {
    return null;
  }

  try {
    const response = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    );

    const data = await response.json();
    const connectionSettings = data.items?.[0];

    if (connectionSettings?.settings?.api_key) {
      return {
        apiKey: connectionSettings.settings.api_key,
        fromEmail: connectionSettings.settings.from_email
      };
    }
  } catch (error) {
    console.log('[Resend] Connection API not available, using environment variable');
  }

  return null;
}

async function getCredentials() {
  // First try Replit Connections
  const connectionCreds = await getCredentialsFromConnection();
  if (connectionCreds) {
    console.log('[Resend] Using Replit Connection');
    return connectionCreds;
  }

  // Fallback to environment variable
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    console.log('[Resend] Using RESEND_API_KEY environment variable');
    return {
      apiKey,
      fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@sebenzahub.co.za'
    };
  }

  throw new Error('Resend not configured - set RESEND_API_KEY or configure Replit Connection');
}

export async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail: fromEmail || 'onboarding@resend.dev'
  };
}

export async function sendMagicLinkEmail(email: string, token: string) {
  let baseUrl: string;
  
  if (process.env.REPLIT_DEPLOYMENT) {
    baseUrl = process.env.PUBLIC_URL || `https://sebenzahub.replit.app`;
  } else if (process.env.REPLIT_DEV_DOMAIN) {
    baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
  } else {
    baseUrl = 'http://localhost:5000';
  }
  
  const magicLink = `${baseUrl}/auth/verify?token=${token}`;

  console.log('\n' + '='.repeat(60));
  console.log('MAGIC LINK');
  console.log('='.repeat(60));
  console.log(`To: ${email}`);
  console.log(`Link: ${magicLink}`);
  console.log('='.repeat(60) + '\n');

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
        <p style="color: #666; font-size: 14px;">This link will expire in 15 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
      </div>
    `,
  });

  if (error) {
    console.error('Resend API Error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  console.log('Email sent successfully, ID:', data?.id);
  return data;
}

export async function sendWelcomeEmail(email: string, name?: string) {
  const { client, fromEmail } = await getUncachableResendClient();

  const { data, error } = await client.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Welcome to Sebenza Hub',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #79583a;">Welcome to Sebenza Hub${name ? `, ${name}` : ''}!</h2>
        <p>Thank you for joining South Africa's transparent recruiting platform.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse job listings with transparent salary ranges</li>
          <li>Upload and manage your CV</li>
          <li>Apply to jobs directly through the platform</li>
          <li>Take competency tests to showcase your skills</li>
        </ul>
        <p style="color: #666; font-size: 14px;">If you have any questions, reply to this email or contact our support team.</p>
      </div>
    `,
  });

  if (error) {
    console.error('Resend API Error:', error);
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }

  return data;
}
