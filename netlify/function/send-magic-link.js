const { Resend } = require('resend');

const resend = new Resend('re_29BgFua3_LWLQ5TyH1X1f59bJb8p6YsMH');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { email, token } = JSON.parse(event.body);
    
    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email is required' }) };
    }

    // Use your actual domain here - replace with your Netlify domain later
    const magicLink = `https://your-lexora-site.netlify.app/dashboard.html?token=${token}&email=${encodeURIComponent(email)}`;
    
    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Lexora <onboarding@resend.dev>',
      to: [email],
      subject: 'Your Magic Link to Access Lexora',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f9d301; text-align: center;">Welcome to Lexora! 🎉</h1>
          <p>Click the button below to access your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}" style="background: #f9d301; color: black; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Access My Account
            </a>
          </div>
          <p>Or copy this link: ${magicLink}</p>
          <p><em>This link expires in 15 minutes</em></p>
        </div>
      `
    });

    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Magic link sent successfully!' 
      })
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to send email' }) };
  }
};
