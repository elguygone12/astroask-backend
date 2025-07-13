const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

// Environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

// Function to get Prokerala API token
async function getAccessToken() {
  console.log('🔐 Getting access token...');
  const res = await fetch('https://api.prokerala.com/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await res.json();
  console.log('🎟️ Prokerala token response:', data);
  return data.access_token;
}

// ✅ Kundli Route
app.post('/api/kundli', async (req, res) => {
  const { dob, time, latitude, longitude, timezone } = req.body;
  console.log('📩 Kundli request body:', req.body);

  try {
    const token = await getAccessToken();

    const url = `https://api.prokerala.com/v2/astrology/kundli?datetime=${dob}T${time}&latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&ayanamsa=1`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const chart = await response.json();
    console.log('📤 Kundli response:', chart);
    res.json(chart);
  } catch (err) {
    console.error('❌ Error fetching kundli chart:', err);
    res.status(500).json({ error: 'Failed to fetch kundli chart' });
  }
});

// ✅ Dasha Route
app.post('/api/dasha', async (req, res) => {
  const { dob, time, latitude, longitude, timezone } = req.body;
  console.log('📩 Dasha request body:', req.body);

  try {
    const token = await getAccessToken();

    const response = await fetch('https://api.prokerala.com/v2/astrology/dasha', {
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

    const dasha = await response.json();
    console.log('📤 Dasha response:', dasha);
    res.json(dasha);
  } catch (err) {
    console.error('❌ Error fetching dasha:', err);
    res.status(500).json({ error: 'Failed to fetch dasha periods' });
  }
});

// ✅ Yearly Forecast Route
app.post('/api/yearly', async (req, res) => {
  const { dob, time, latitude, longitude, timezone, language } = req.body;
  console.log('📩 Yearly forecast request body:', req.body);

  try {
    const token = await getAccessToken();

    const response = await fetch('https://api.prokerala.com/v2/astrology/predictions/yearly', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        datetime: `${dob}T${time}`,
        coordinates: { latitude, longitude },
        timezone,
        language: language || 'en',
      }),
    });

    const forecast = await response.json();
    console.log('📤 Yearly forecast response:', forecast);
    res.json(forecast);
  } catch (err) {
    console.error('❌ Error fetching yearly forecast:', err);
    res.status(500).json({ error: 'Failed to fetch yearly forecast' });
  }
});

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
