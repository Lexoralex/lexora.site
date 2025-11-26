const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Resend } = require('resend');

admin.initializeApp();
const resend = new Resend('re_29BgFua3_LML05TyH1X1f59bJb8p6YsWH');

exports.sendMagicLink = functions.https.onCall(async (data, context) => {
  const { email } = data;

  // Validate email
  if (!email || !email.includes('@')) {
    throw new functions.https.HttpsError(
      'invalid-argument', 
      'Valid email is required'
    );
  }

  try {
    // 1. Generate Firebase Auth token
    const customToken = await admin.auth().createCustomToken(email);
    
    // 2. Create magic link (pointing to your GitHub Pages)
    const magicLink = `https://lexoralex.github.io/lexora.site/dashboard.html?token=${customToken}&email=${encodeURIComponent(email)}`;

    // 3. Send email via Resend
    const { data: emailData, error } = await resend.emails.send({
      from: 'Lexora <lexoralexhelp@gmail.com>',
      to: [email],
      subject: 'Your Magic Login Link 🔐',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Lexora! 👋</h2>
          <p>Click the button below to access your dashboard:</p>
          <a href="${magicLink}" 
             style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
            Access Your Dashboard
          </a>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link:<br>
            <code style="background: #f5f5f5; padding: 8px; border-radius: 4px; word-break: break-all;">${magicLink}</code>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            This link expires in 15 minutes.
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      throw new functions.https.HttpsError('internal', 'Failed to send email');
    }

    return { 
      success: true, 
      message: 'Magic link sent to your email!',
      emailId: emailData.id 
    };

  } catch (error) {
    console.error('Function error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process request');
  }
});
