require('dotenv').config();
const fetch = require('node-fetch');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

async function getAccessToken() {
  try {
    const res = await fetch('https://api.prokerala.com/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const data = await res.json();

    if (data.access_token) {
      console.log('✅ Access Token:', data.access_token);
    } else {
      console.error('❌ Failed to get token:', data);
    }
  } catch (err) {
    console.error('❌ Error fetching token:', err);
  }
}

getAccessToken();
