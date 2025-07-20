// server.js with file-based caching and 24-hour expiry

require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 📁 Setup cache folder
const CACHE_DIR = path.join(__dirname, 'cache');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);

// ⏱️ Cache helpers
function getCachePath(key) {
  return path.join(CACHE_DIR, `${key}.json`);
}

function createCacheKey(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64').replace(/[/=+]/g, '_');
}

function readCacheIfFresh(cachePath, maxAgeMs = 24 * 60 * 60 * 1000) {
  if (fs.existsSync(cachePath)) {
    try {
      const stats = fs.statSync(cachePath);
      const fileAge = Date.now() - stats.mtimeMs;

      if (fileAge < maxAgeMs) {
        const cached = fs.readFileSync(cachePath, 'utf-8');
        return JSON.parse(cached);
      } else {
        fs.unlinkSync(cachePath); // delete old cache
      }
    } catch (err) {
      console.error('❌ Error reading cache:', err);
      fs.unlinkSync(cachePath); // corrupted
    }
  }
  return null;
}

// 🔐 Get Prokerala Access Token
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

// 📊 Kundli Chart API with 24h cache
app.post('/api/kundli', async (req, res) => {
  const { dob, time, latitude, longitude, timezone } = req.body;

  if (!dob || !time || !latitude || !longitude || !timezone) {
    return res.status(400).json({ error: 'Missing birth details' });
  }

  const datetime = `${dob}T${time}:00${timezone}`;
  const coordinates = `${latitude},${longitude}`;
  const cacheKey = createCacheKey({ datetime, coordinates });
  const cachePath = getCachePath(cacheKey);

  const cachedData = readCacheIfFresh(cachePath);
  if (cachedData) return res.json(cachedData);

  try {
    const token = await getAccessToken();
    const response = await fetch(
      `https://api.prokerala.com/v2/astrology/kundli?datetime=${encodeURIComponent(datetime)}&coordinates=${coordinates}&ayanamsa=1`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const text = await response.text();
    const data = JSON.parse(text);

    fs.writeFileSync(cachePath, JSON.stringify(data));
    res.json(data);
  } catch (err) {
    console.error('❌ Kundli error:', err);
    res.status(500).json({ error: 'Failed to fetch chart' });
  }
});

// 🧠 AI Explanation (Chart, Dasha, Yearly) with cache
async function handleAIExplanation(req, res, promptType) {
  const { data, language } = req.body;
  const cacheKey = createCacheKey({ type: promptType, data, language });
  const cachePath = getCachePath(cacheKey);

  const cachedData = readCacheIfFresh(cachePath);
  if (cachedData) return res.json(cachedData);

  let systemPrompt = '';
  switch (promptType) {
    case 'chart':
      systemPrompt = `You are an expert Vedic astrologer. Explain the following kundli chart data clearly in ${language === 'hi' ? 'Hindi' : 'English'}.`;
      break;
    case 'dasha':
      systemPrompt = `You are an expert Vedic astrologer. Explain the following Vimshottari Dasha periods in ${language === 'hi' ? 'Hindi' : 'English'}.`;
      break;
    case 'yearly':
      systemPrompt = `You are an astrologer. Based on the user's birth details (DOB, time, location), generate a personalized yearly forecast in ${language === 'hi' ? 'Hindi' : 'English'}.`;
      break;
  }

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(data) },
        ],
      }),
    });

    const gptJson = await gptRes.json();
    const explanation = gptJson.choices?.[0]?.message?.content || 'No explanation received.';
    const result = { explanation };

    fs.writeFileSync(cachePath, JSON.stringify(result));
    res.json(result);
  } catch (error) {
    console.error(`❌ ${promptType} AI error:`, error);
    res.status(500).json({ error: 'Failed to get explanation' });
  }
}

app.post('/api/explain/chart', (req, res) => handleAIExplanation(req, res, 'chart'));
app.post('/api/explain/dasha', (req, res) => handleAIExplanation(req, res, 'dasha'));
app.post('/api/explain/yearly', (req, res) => handleAIExplanation(req, res, 'yearly'));

// 404 fallback
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});







