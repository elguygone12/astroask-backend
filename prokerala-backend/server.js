require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

// 🔐 ENV Variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 🔄 Get Prokerala Access Token
async function getAccessToken() {
  const res = await fetch('https://api.prokerala.com/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
}

// 📊 Kundli Chart (Safe JSON parsing)
app.post('/api/kundli', async (req, res) => {
  const { dob, time, latitude, longitude, timezone } = req.body;

  if (!dob || !time || !latitude || !longitude || !timezone) {
    return res.status(400).json({ error: 'Missing birth details' });
  }

  try {
    const token = await getAccessToken();
    const datetime = `${dob}T${time}:00${timezone}`;
    const coordinates = `${latitude},${longitude}`;

    const response = await fetch(
      `https://api.prokerala.com/v2/astrology/kundli?datetime=${encodeURIComponent(datetime)}&coordinates=${coordinates}&ayanamsa=1`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch (e) {
      console.error('❌ Invalid JSON from Prokerala:', text);
      res.status(500).json({ error: 'Invalid data from Prokerala' });
    }
  } catch (err) {
    console.error('❌ Kundli error:', err);
    res.status(500).json({ error: 'Failed to fetch chart' });
  }
});

// 📅 Daily Panchang
app.post('/api/panchang', async (req, res) => {
  const { dob, latitude, longitude, timezone } = req.body;
  try {
    const token = await getAccessToken();
    const response = await fetch(
      `https://api.prokerala.com/v2/astrology/panchang?datetime=${dob}T00:00:00${timezone}&coordinates=${latitude},${longitude}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('❌ Panchang error:', error);
    res.status(500).json({ error: 'Failed to fetch panchang' });
  }
});

// 💍 Marriage Matching
app.post('/api/marriage-match', async (req, res) => {
  const {
    boyDob, boyTime, boyLat, boyLng,
    girlDob, girlTime, girlLat, girlLng,
    timezone,
  } = req.body;

  try {
    const token = await getAccessToken();
    const response = await fetch(
      `https://api.prokerala.com/v2/astrology/match-making?boy_dob=${boyDob}T${boyTime}:00${timezone}&boy_coordinates=${boyLat},${boyLng}&girl_dob=${girlDob}T${girlTime}:00${timezone}&girl_coordinates=${girlLat},${girlLng}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('❌ Match error:', error);
    res.status(500).json({ error: 'Failed to fetch match result' });
  }
});

// 🔢 Numerology
app.post('/api/numerology', async (req, res) => {
  const { name, dob } = req.body;

  try {
    const token = await getAccessToken();
    const response = await fetch(
      `https://api.prokerala.com/v2/numerology/name-number?name=${encodeURIComponent(name)}&dob=${dob}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('❌ Numerology error:', error);
    res.status(500).json({ error: 'Failed to fetch numerology data' });
  }
});

// 🧠 PDF Report Placeholder
app.post('/api/pdf-report', async (req, res) => {
  res.json({
    reportUrl: 'https://example.com/sample-astro-report.pdf',
    message: 'This is a placeholder. PDF generation will be added soon.',
  });
});

// 🧠 AI: Explain Kundli
app.post('/api/explain/chart', async (req, res) => {
  const { data, language } = req.body;

  try {
    const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert Vedic astrologer. Explain the following kundli chart data clearly in ${language === 'hi' ? 'Hindi' : 'English'}.`,
          },
          {
            role: 'user',
            content: JSON.stringify(data),
          },
        ],
      }),
    });

    const gptJson = await gptRes.json();
    const explanation = gptJson.choices?.[0]?.message?.content || 'No explanation received.';
    res.json({ explanation });
  } catch (error) {
    console.error('❌ Chart AI error:', error);
    res.status(500).json({ error: 'Failed to get chart explanation' });
  }
});

// 🧠 AI: Explain Dasha
app.post('/api/explain/dasha', async (req, res) => {
  const { data, language } = req.body;

  try {
    const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert Vedic astrologer. Explain the following Vimshottari Dasha periods in ${language === 'hi' ? 'Hindi' : 'English'}.`,
          },
          {
            role: 'user',
            content: JSON.stringify(data),
          },
        ],
      }),
    });

    const gptJson = await gptRes.json();
    const explanation = gptJson.choices?.[0]?.message?.content || 'No explanation received.';
    res.json({ explanation });
  } catch (error) {
    console.error('❌ Dasha AI error:', error);
    res.status(500).json({ error: 'Failed to get dasha explanation' });
  }
});

// 🧠 AI: Yearly Forecast
app.post('/api/explain/yearly', async (req, res) => {
  const { data, language } = req.body;

  try {
    const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an astrologer. Based on the user's birth details (DOB, time, location), generate a personalized yearly forecast in ${language === 'hi' ? 'Hindi' : 'English'}.`,
          },
          {
            role: 'user',
            content: JSON.stringify(data),
          },
        ],
      }),
    });

    const gptJson = await gptRes.json();
    const explanation = gptJson.choices?.[0]?.message?.content || 'No explanation received.';
    res.json({ explanation });
  } catch (error) {
    console.error('❌ Yearly AI error:', error);
    res.status(500).json({ error: 'Failed to get yearly forecast' });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});



