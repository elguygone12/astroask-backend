const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const crypto = require('crypto');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Setup OpenAI (v4 SDK)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🔒 Utility to get cache file path
function getCacheFilePath(type, data) {
  const hash = crypto.createHash('sha256').update(JSON.stringify({ type, data })).digest('hex');
  return path.join(__dirname, 'cache', `${type}_${hash}.json`);
}

// 🗂️ Ensure cache folder exists
const cacheDir = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

// 🔮 POST /api/kundli — Get chart from Prokerala
app.post('/api/kundli', async (req, res) => {
  const { dob, time, latitude, longitude, timezone } = req.body;

  try {
    const response = await axios.post(process.env.PROKERALA_API_URL, {
      dob,
      time,
      latitude,
      longitude,
      timezone,
    }, {
      headers: {
        Authorization: `Bearer ${process.env.PROKERALA_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    res.json({ data: response.data });
  } catch (err) {
    console.error('❌ Prokerala fetch error:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

// 🧠 POST /api/explain/chart — AI explanation for chart
app.post('/api/explain/chart', async (req, res) => {
  await handleAIExplanation(req, res, 'chart');
});

// 🧠 POST /api/explain/dasha — AI explanation for Dasha
app.post('/api/explain/dasha', async (req, res) => {
  await handleAIExplanation(req, res, 'dasha');
});

// 🧠 POST /api/explain/yearly — AI explanation for yearly forecast
app.post('/api/explain/yearly', async (req, res) => {
  await handleAIExplanation(req, res, 'yearly');
});

// ✨ AI Explanation Handler
async function handleAIExplanation(req, res, type) {
  const { data, language = 'en' } = req.body;
  const filePath = getCacheFilePath(type, { data, language });

  // Serve from cache if exists
  if (fs.existsSync(filePath)) {
    const cached = fs.readFileSync(filePath, 'utf-8');
    return res.json(JSON.parse(cached));
  }

  // 💬 Create prompt
  let prompt = '';
  if (type === 'chart') {
    prompt = `Give an astrology reading explanation in ${language} based on the following kundli chart data:\n\n${JSON.stringify(data, null, 2)}`;
  } else if (type === 'dasha') {
    prompt = `Explain the meaning and predictions for this Vimshottari Dasha period in ${language}:\n\n${JSON.stringify(data, null, 2)}`;
  } else if (type === 'yearly') {
    prompt = `Give an annual astrology prediction in ${language} based on the following birth details and planetary periods:\n\n${JSON.stringify(data, null, 2)}`;
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
    console.error(`❌ ${type} AI error:`, err);
    res.status(500).json({ error: 'AI explanation failed' });
  }
}

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});










