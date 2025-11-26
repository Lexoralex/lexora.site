const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Resend } = require('resend');

admin.initializeApp();
const resend = new Resend('re_29BgFua3_LML05TyH1X1f59bJb8p6YsWH');

exports.sendMagicLink = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Valid email is required' });
      return;
    }

    console.log('Sending magic link to:', email);

    // Generate secure token
    const customToken = await admin.auth().createCustomToken(email);
    
    // Create magic link
    const magicLink = `https://lexoralex.github.io/lexora.site/dashboard.html?token=${customToken}&email=${encodeURIComponent(email)}`;

    console.log('Magic link created:', magicLink);

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Lexora <lexoralexhelp@gmail.com>',
      to: [email],
      subject: 'Your Magic Login Link 🔐 - Lexora',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Welcome to Lexora! 👋</h2>
          <p style="font-size: 16px; color: #555;">Click the button below to access your dashboard:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}" 
               style="background-color: #0070f3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
              Access Your Dashboard
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link in your browser:<br>
            <code style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all; display: block; margin: 10px 0;">${magicLink}</code>
          </p>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
            This link will expire in 1 hour.
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error('Failed to send email: ' + error.message);
    }

    console.log('Email sent successfully:', data);

    res.json({ 
      success: true, 
      message: 'Magic link sent to your email!',
      emailId: data.id 
    });

  } catch (error) {
    console.error('Function error:', error);
    res.status(500).json({ 
      error: 'Failed to send magic link: ' + error.message 
    });
  }
});
