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
      'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
}

// 📊 Kundli Chart
app.post('/api/kundli', async (req, res) => {
  const { dob, time, latitude, longitude, timezone } = req.body;
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

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('❌ Kundli error:', err);
    res.status(500).json({ error: 'Failed to fetch chart' });
  }
});

// 🪐 Dasha Periods
app.post('/api/dasha', async (req, res) => {
  const { dob, time, latitude, longitude, timezone } = req.body;
  try {
    const token = await getAccessToken();
    const datetime = `${dob}T${time}:00${timezone}`;
    const coordinates = `${latitude},${longitude}`;

    const response = await fetch(
      `https://api.prokerala.com/v2/astrology/vimshottari-dasha?datetime=${encodeURIComponent(datetime)}&coordinates=${coordinates}&ayanamsa=1`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('❌ Dasha error:', err);
    res.status(500).json({ error: 'Failed to fetch dasha' });
  }
});

// 🧠 ChatGPT: Explain Kundli Chart
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

// 🧠 ChatGPT: Explain Dasha Periods
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

// 🧠 ChatGPT: AI-Only Yearly Forecast
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
