const { Resend } = require('resend');
const resend = new Resend('re_29BgFua3_LML05TyH1X1f59bJb8p6YsWH');

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

    // FIX: Update this to your actual domain
    const magicLink = `https://loxerabackend.netlify.app/dashboard.html?token=${token}&email=${encodeURIComponent(email)}`;

    const { data, error } = await resend.emails.send({
      from: 'Lexora <onboarding@resend.dev>',
      to: [email],
      subject: 'Your Magic Login Link',
      html: `Click here to login: <a href="${magicLink}">${magicLink}</a>`
    });

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to send email' })
      };
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
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
