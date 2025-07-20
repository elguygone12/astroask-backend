const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// Cache directory
const cacheDir = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

// 🔐 Generate cache file path
function getCacheFilePath(type, data) {
  const hash = crypto.createHash('sha256').update(JSON.stringify({ type, data })).digest('hex');
  return path.join(cacheDir, `${type}_${hash}.json`);
}

// 🌐 POST /api/kundli — Fetch kundli data
app.post('/api/kundli', async (req, res) => {
  const { dob, time, latitude, longitude, timezone } = req.body;
  try {
    const response = await axios.post(process.env.PROKERALA_API_URL, {
      dob, time, latitude, longitude, timezone
    }, {
      headers: {
        Authorization: `Bearer ${process.env.PROKERALA_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    res.json({ data: response.data });
  } catch (err) {
    console.error('❌ Prokerala error:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch kundli chart data' });
  }
});

// 📍 POST /api/explain/* — Routes
app.post('/api/explain/chart', async (req, res) => handleAIExplanation(req, res, 'chart'));
app.post('/api/explain/dasha', async (req, res) => handleAIExplanation(req, res, 'dasha'));
app.post('/api/explain/yearly', async (req, res) => handleAIExplanation(req, res, 'yearly'));

// 💡 AI Handler
async function handleAIExplanation(req, res, type) {
  const { data, language = 'en' } = req.body;
  const cachePath = getCacheFilePath(type, { data, language });

  if (fs.existsSync(cachePath)) {
    const cached = fs.readFileSync(cachePath, 'utf-8');
    return res.json(JSON.parse(cached));
  }

  // Prompts
  let prompt = '';
  if (type === 'chart') {
    prompt = `You are an expert astrologer. Explain the kundli chart in ${language}:\n\n${JSON.stringify(data, null, 2)}`;
  } else if (type === 'dasha') {
    prompt = `You are an expert astrologer. Explain these Vimshottari Dasha periods in ${language}:\n\n${JSON.stringify(data, null, 2)}`;
  } else if (type === 'yearly') {
    prompt = `You are an astrologer. Provide a yearly prediction in ${language} based on the birth chart:\n\n${JSON.stringify(data, null, 2)}`;
  }

  try {
    const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const gptJson = await gptRes.json();
    const explanation = gptJson.choices?.[0]?.message?.content?.trim() || 'No explanation generated.';
    const result = { explanation };

    fs.writeFileSync(cachePath, JSON.stringify(result, null, 2), 'utf-8');
    res.json(result);
  } catch (err) {
    console.error(`❌ ${type} AI error:`, err);
    res.status(500).json({ error: 'Failed to generate AI explanation' });
  }
}

// 🚀 Start
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});








