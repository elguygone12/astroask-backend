const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const crypto = require('crypto');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// Setup OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Create cache dir if not exists
const cacheDir = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

// Utility: Create cache file path
function getCacheFilePath(type, data) {
  const hash = crypto.createHash('sha256').update(JSON.stringify({ type, data })).digest('hex');
  return path.join(cacheDir, `${type}_${hash}.json`);
}

// 🔐 Get Prokerala access token using client credentials
async function getProkeralaAccessToken() {
  try {
    const response = await axios.post(
      'https://api.prokerala.com/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );
    return response.data.access_token;
  } catch (err) {
    console.error('❌ Failed to get Prokerala token:', err?.response?.data || err.message);
    throw new Error('Prokerala token fetch failed');
  }
}

// 📩 /api/kundli — Get birth chart
app.post('/api/kundli', async (req, res) => {
  const { dob, time, latitude, longitude, timezone } = req.body;

  try {
    const token = await getProkeralaAccessToken();

    const response = await axios.get(
      'https://api.prokerala.com/v2/astrology/birth-details',
      {
        params: {
          datetime: `${dob}T${time}`,
          latitude,
          longitude,
          timezone,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json({ data: response.data });
  } catch (err) {
    console.error('❌ Prokerala error:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

// 🔮 AI explain endpoints
app.post('/api/explain/chart', async (req, res) => {
  await handleAIExplanation(req, res, 'chart');
});

app.post('/api/explain/dasha', async (req, res) => {
  await handleAIExplanation(req, res, 'dasha');
});

app.post('/api/explain/yearly', async (req, res) => {
  await handleAIExplanation(req, res, 'yearly');
});

// 💡 AI Explanation logic with caching
async function handleAIExplanation(req, res, type) {
  const { data, language = 'en' } = req.body;
  const filePath = getCacheFilePath(type, { data, language });

  if (fs.existsSync(filePath)) {
    const cached = fs.readFileSync(filePath, 'utf-8');
    return res.json(JSON.parse(cached));
  }

  let prompt = '';
  if (type === 'chart') {
    prompt = `Give a detailed astrology explanation in ${language} based on this chart:\n\n${JSON.stringify(data, null, 2)}`;
  } else if (type === 'dasha') {
    prompt = `Explain the following Vimshottari Dasha period in ${language}:\n\n${JSON.stringify(data, null, 2)}`;
  } else if (type === 'yearly') {
    prompt = `Provide a yearly astrology prediction in ${language} based on:\n\n${JSON.stringify(data, null, 2)}`;
  }

  try {
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const explanation = aiResponse.choices[0]?.message?.content?.trim() || 'No explanation generated.';
    const result = { explanation };
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2), 'utf-8');
    res.json(result);
  } catch (err) {
    console.error(`❌ ${type} AI error:`, err?.response?.data || err.message);
    res.status(500).json({ error: 'AI explanation failed' });
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});












