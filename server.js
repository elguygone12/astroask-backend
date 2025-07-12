const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

const CLIENT_ID = '1956428f-689a-401c-b7d0-c75e81f64530';
const CLIENT_SECRET = 'jEjjsGzxJqkTiYth87d12WrARFASpSzsyPgrQd4Y';

async function getAccessToken() {
  const res = await fetch('https://api.prokerala.com/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await res.json();
  return data.access_token;
}

app.post('/api/kundli', async (req, res) => {
  const { dob, time, latitude, longitude, timezone } = req.body;

  try {
    const token = await getAccessToken();

    const response = await fetch('https://api.prokerala.com/v2/astrology/kundli', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        datetime: `${dob}T${time}`,
        coordinates: { latitude, longitude },
        timezone,
        ayanamsa: 1,
      }),
    });

    const chart = await response.json();
    res.json(chart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
