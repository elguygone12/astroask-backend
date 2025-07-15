require('dotenv').config();

const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

// 🔐 ENV variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 🔄 Get Prokerala access token
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

// 📊 Kundli chart
app.post('/api/kundli', async (req, res) => {
  const { dob, time, latitude, longitude, timezone } = req.body;

  try {
    const token = await getAccessToken();
    const datetime = `${dob}T${time}:00${timezone}`;
    const coordinates = `${latitude},${longitude}`;

    const response = await fetch(`https://api.prokerala.com/v2/astrology/kundli?datetime=${encodeURIComponent(datetime)}&coordinates=${coordinates}&ayanamsa=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('❌ Kundli error:', err);
    res.status(500).json({ error: 'Failed to fetch chart' });
  }
});

// 🪐 Dasha periods
app.post('/api/dasha', async (req, res) => {
  const { dob, time, latitude, longitude, timezone } = req.body;

  try {
    const token = await getAccessToken();
    const datetime = `${dob}T${time}:00${timezone}`;
    const coordinates = `${latitude},${longitude}`;

    const response = await fetch(`https://api.prokerala.com/v2/astrology/vimshottari-dasha?datetime=${encodeURIComponent(datetime)}&coordinates=${coordinates}&ayanamsa=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('❌ Dasha error:', err);
    res.status(500).json({ error: 'Failed to fetch dasha' });
  }
});

// 📆 Yearly Forecast
app.post('/api/yearly', async (req, res) => {
  const { dob, time, latitude, longitude, timezone, language } = req.body;

  try {
    const token = await getAccessToken();
    const datetime = `${dob}T${time}:00${timezone}`;
    const coordinates = `${latitude},${longitude}`;

    const response = await fetch('https://api.prokerala.com/v2/astrology/predictions/yearly', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        datetime,
        coordinates,
        timezone,
        language: language || 'en',
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('❌ Yearly forecast error:', err);
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
});

// 🤖 Explain Chart via ChatGPT
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
            content: `You are an expert astrologer. Explain this Vedic chart data clearly in ${language === 'hi' ? 'Hindi' : 'English'}.`,
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

// 🤖 Explain Dasha via ChatGPT
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
            content: `You are an expert astrologer. Explain these Dasha periods in ${language === 'hi' ? 'Hindi' : 'English'}.`,
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

// 🤖 Explain Yearly via ChatGPT
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
            content: `You are a Vedic astrologer. Based on the following monthly astrology forecast, give an overall summary for the year in ${language === 'hi' ? 'Hindi' : 'English'}.`,
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
    res.status(500).json({ error: 'Failed to get yearly explanation' });
  }
});

// ✅ Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
