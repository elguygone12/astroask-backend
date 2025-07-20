const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const { Configuration, OpenAIApi } = require('openai');
const crypto = require('crypto');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// 🔐 Setup OpenAI
const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

// 📁 Ensure cache directory exists
const cacheDir = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

// 📦 Cache file path using hash
function getCacheFilePath(type, data) {
  const hash = crypto.createHash('sha256').update(JSON.stringify({ type, data })).digest('hex');
  return path.join(cacheDir, `${type}_${hash}.json`);
}

// 🔐 Get Prokerala Access Token
async function getAccessToken() {
  const credentials = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64');

  const response = await axios.post(
    'https://api.prokerala.com/token',
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data.access_token;
}

// 📊 POST /api/kundli — fetch chart data from Prokerala
app.post('/api/kundli', async (req, res) => {
  const { dob, time, latitude, longitude, timezone } = req.body;

  if (!dob || !time || !latitude || !longitude || !timezone) {
    return res.status(400).json({ error: 'Missing birth details' });
  }

  try {
    const token = await getAccessToken();
    const datetime = `${dob}T${time}:00${timezone}`;
    const coordinates = `${latitude},${longitude}`;

    const response = await axios.get('https://api.prokerala.com/v2/astrology/kundli', {
      params: {
        datetime,
        coordinates,
        ayanamsa: 1,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error('❌ Prokerala API error:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

// 🧠 AI Explanation Endpoints
app.post('/api/explain/chart', async (req, res) => {
  await handleAIExplanation(req, res, 'chart');
});

app.post('/api/explain/dasha', async (req, res) => {
  await handleAIExplanation(req, res, 'dasha');
});

app.post('/api/explain/yearly', async (req, res) => {
  await handleAIExplanation(req, res, 'yearly');
});

// 🧠 Handle AI Explanation (with caching)
async function handleAIExplanation(req, res, type) {
  const { data, language = 'en' } = req.body;
  const filePath = getCacheFilePath(type, { data, language });

  // ✅ Serve from cache if exists
  if (fs.existsSync(filePath)) {
    const cached = fs.readFileSync(filePath, 'utf-8');
    return res.json(JSON.parse(cached));
  }

  // 🧾 Prompt setup
  let prompt = '';
  if (type === 'chart') {
    prompt = `You are an expert Vedic astrologer. Explain this kundli chart in ${language}:\n\n${JSON.stringify(data, null, 2)}`;
  } else if (type === 'dasha') {
    prompt = `You are an expert Vedic astrologer. Explain this Vimshottari Dasha period in ${language}:\n\n${JSON.stringify(data, null, 2)}`;
  } else if (type === 'yearly') {
    prompt = `Based on this birth chart and dasha, give a detailed yearly prediction in ${language}:\n\n${JSON.stringify(data, null, 2)}`;
  }

  try {
    const aiResponse = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const explanation = aiResponse.data.choices?.[0]?.message?.content?.trim() || 'No explanation generated.';
    const result = { explanation };

    fs.writeFileSync(filePath, JSON.stringify(result, null, 2), 'utf-8');
    res.json(result);
  } catch (err) {
    console.error(`❌ OpenAI API error (${type}):`, err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to get AI explanation' });
  }
}

// 🌐 Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});









