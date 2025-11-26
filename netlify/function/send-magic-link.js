const { Resend } = require('resend');

// Use environment variable for API key
const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
  // Check HTTP method
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method not allowed' }) 
    };
  }

  try {
    const { email, token } = JSON.parse(event.body);
    
    if (!email) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'Email is required' }) 
      };
    }
    
    if (!token) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'Token is required' }) 
      };
    }

    // Create magic link - replace with your actual domain
    const magicLink = `https://your-lexora-site.netlify.app/dashboard.html?token=${token}&email=${encodeURIComponent(email)}`;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Lexora <onboarding@resend.dev>',
      to: [email],
      subject: 'Your Magic Login Link',
      html: `
        <h2>Your Magic Login Link</h2>
        <p>Click the link below to access your dashboard:</p>
        <a href="${magicLink}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Access Dashboard
        </a>
        <p>Or copy and paste this URL:</p>
        <p>${magicLink}</p>
        <p><small>This link will expire in 15 minutes.</small></p>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to send email' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Magic link sent successfully',
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
