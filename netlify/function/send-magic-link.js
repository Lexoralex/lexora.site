const https = require('https');

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

    // Use https module instead of fetch
    const emailData = JSON.stringify({
      from: 'Lexora <onboarding@resend.dev>',
      to: [email],
      subject: 'Your Magic Login Link',
      html: `Click here to login: <a href="${magicLink}">${magicLink}</a>`
    });

    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer re_29BgFua3_LML05TyH1X1f59bJb8p6YsWH',
        'Content-Type': 'application/json',
        'Content-Length': emailData.length
      }
    };

    // Make the API request
    const result = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });
      
      req.on('error', reject);
      req.write(emailData);
      req.end();
    });

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
