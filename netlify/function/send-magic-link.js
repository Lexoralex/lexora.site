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
        html: `Click here to login: <a href="${magicLink}">${magicLink}</a>`
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send email');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Magic link sent successfully'
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to send email: ' + error.message
      })
    };
  }
};
