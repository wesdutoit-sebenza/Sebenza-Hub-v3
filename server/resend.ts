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
    subject: 'Your Sebenza Hub Sign-In Link',
    html: `
<div style="background-color:#f0f2f3; padding:40px 0; font-family: 'Montserrat', Arial, sans-serif;">
  <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:14px; padding:40px; border:1px solid #e5e7eb;">

    <div style="text-align:center; margin-bottom:24px;">
      <img src="https://sebenzahub.co.za/logo.png"
           alt="Sebenza Hub"
           style="width:140px; height:auto;" />
    </div>

    <h2 style="text-align:center; margin:0; font-size:24px; color:#2e2f31; font-weight:700;">
      Sign in to Sebenza Hub
    </h2>

    <p style="font-size:15px; color:#4a4d50; margin-top:24px; line-height:1.7;">
      Hi there,
      <br><br>
      Tap the button below to sign in. Your magic link expires in
      <strong>15 minutes</strong> for security.
    </p>

    <div style="text-align:center; margin:36px 0;">
      <a href="${magicLink}"
         style="
           background-color:#f4a300;
           color:#ffffff;
           padding:14px 28px;
           border-radius:10px;
           text-decoration:none;
           font-size:16px;
           font-weight:600;
           display:inline-block;
           box-shadow:0 4px 10px rgba(244,163,0,0.25);
         ">
        Sign In
      </a>
    </div>

    <p style="font-size:14px; color:#5c6369; line-height:1.6;">
      If the button doesn't work, use the link below:
      <br><br>
      <span style="color:#5c6369; word-break:break-all;">
        ${magicLink}
      </span>
    </p>

    <hr style="border:0; border-top:1px solid #e1dacc; margin:32px 0;">

    <p style="font-size:12px; text-align:center; color:#5c6369; line-height:1.6;">
      You're receiving this email because you attempted to sign in to Sebenza Hub.
      <br>
      If you didn't request this link, you can safely ignore it.
    </p>

    <div style="text-align:center; margin-top:18px;">
      <p style="font-size:12px; color:#70787e;">
        &copy; 2025 Sebenza Hub &middot; All rights reserved
      </p>
    </div>

  </div>
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
<div style="background-color:#f0f2f3; padding:40px 0; font-family: 'Montserrat', Arial, sans-serif;">
  <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:14px; padding:40px; border:1px solid #e5e7eb;">

    <div style="text-align:center; margin-bottom:24px;">
      <img src="https://sebenzahub.co.za/logo.png"
           alt="Sebenza Hub"
           style="width:140px; height:auto;" />
    </div>

    <h2 style="text-align:center; margin:0; font-size:24px; color:#2e2f31; font-weight:700;">
      Welcome to Sebenza Hub${name ? `, ${name}` : ''}!
    </h2>

    <p style="font-size:15px; color:#4a4d50; margin-top:24px; line-height:1.7;">
      Thank you for joining South Africa's transparent recruiting platform.
    </p>

    <p style="font-size:15px; color:#4a4d50; line-height:1.7;">
      You can now:
    </p>

    <ul style="font-size:15px; color:#4a4d50; line-height:2; padding-left:20px;">
      <li>Browse job listings with transparent salary ranges</li>
      <li>Upload and manage your CV</li>
      <li>Apply to jobs directly through the platform</li>
      <li>Take competency tests to showcase your skills</li>
    </ul>

    <div style="text-align:center; margin:36px 0;">
      <a href="https://sebenzahub.co.za/dashboard"
         style="
           background-color:#f4a300;
           color:#ffffff;
           padding:14px 28px;
           border-radius:10px;
           text-decoration:none;
           font-size:16px;
           font-weight:600;
           display:inline-block;
           box-shadow:0 4px 10px rgba(244,163,0,0.25);
         ">
        Go to Dashboard
      </a>
    </div>

    <hr style="border:0; border-top:1px solid #e1dacc; margin:32px 0;">

    <p style="font-size:12px; text-align:center; color:#5c6369; line-height:1.6;">
      If you have any questions, reply to this email or contact our support team.
    </p>

    <div style="text-align:center; margin-top:18px;">
      <p style="font-size:12px; color:#70787e;">
        &copy; 2025 Sebenza Hub &middot; All rights reserved
      </p>
    </div>

  </div>
</div>
    `,
  });

  if (error) {
    console.error('Resend API Error:', error);
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }

  return data;
}
