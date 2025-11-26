const { Resend } = require('resend');

const resend = new Resend('re_29BgFua3_LWLQ5TyH1X1f59bJb8p6YsMH');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email } = JSON.parse(event.body);
    
    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    // Generate unique token
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const magicLink = `${process.env.URL || 'https://your-site.netlify.app'}/dashboard.html?token=${token}&email=${encodeURIComponent(email)}`;
    
    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Lexora <onboarding@resend.dev>',
      to: [email],
      subject: 'Your Magic Link to Access Lexora',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
            .container { max-width: 600px; background: white; padding: 40px; border-radius: 10px; margin: 0 auto; }
            .header { text-align: center; color: #f9d301; }
            .button { background: #f9d301; color: black; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Lexora!</h1>
            </div>
            <p>Click the button below to securely access your account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${magicLink}" class="button">Access My Account</a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p><a href="${magicLink}">${magicLink}</a></p>
            <div class="footer">
              <p>This link will expire in 15 minutes.</p>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Magic link sent successfully!',
        emailId: data.id
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
