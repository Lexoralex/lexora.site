exports.handler = async (event) => {
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

    const magicLink = `https://loxerabackend.netlify.app/dashboard.html?token=${token}&email=${encodeURIComponent(email)}`;

    console.log('Attempting to send email to:', email);

    // Use Resend API directly with fetch
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer re_29BgFua3_LML05TyH1X1f59bJb8p6YsWH',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Lexora <onboarding@resend.dev>',
        to: [email],
        subject: 'Your Magic Login Link',
        html: `
          <h2>Welcome to Lexora! 🔐</h2>
          <p>Click the button below to access your dashboard:</p>
          <a href="${magicLink}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-size: 16px;">
            Access Your Dashboard
          </a>
          <p style="margin-top: 20px; color: #666;">
            Or copy and paste this link in your browser:<br>
            ${magicLink}
          </p>
          <p><small>This link will expire in 15 minutes.</small></p>
        `
      }),
    });

    const result = await response.json();

    console.log('Resend API response:', response.status, result);

    if (!response.ok) {
      throw new Error(result.message || `HTTP ${response.status}: Failed to send email`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        message: 'Magic link sent successfully! Check your email.',
        emailId: result.id
      })
    };

  } catch (error) {
    console.error('Full error details:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to send email',
        details: error.message
      })
    };
  }
};
