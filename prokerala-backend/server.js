const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const crypto = require('crypto');
const fetch = require('node-fetch');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 10000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const CACHE_DIR = path.join(__dirname, 'cache');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);

// ✅ Short hashed cache key to avoid ENAMETOOLONG
const getCacheKey = (type, data, language) => {
  const raw = JSON.stringify({ type, data, language });
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return `${hash}.json`;
};

const getCached = (key) => {
  const file = path.join(CACHE_DIR, key);
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  }
  return null;
};

const setCached = (key, data) => {
  const file = path.join(CACHE_DIR, key);
  fs.writeFileSync(file, JSON.stringify(data), 'utf-8');
};

const handleAIExplanation = async (type, data, language = 'en') => {
  const cacheKey = getCacheKey(type, data, language);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const prompt = {
    chart: `Explain this Kundli chart in simple ${language === 'hi' ? 'Hindi' : 'English'}:\n\n${JSON.stringify(data)}`,
    dasha: `Explain this Vimshottari Dasha in simple ${language === 'hi' ? 'Hindi' : 'English'}:\n\n${JSON.stringify(data)}`,
    yearly: `Give a detailed yearly prediction based on this chart for the upcoming year in ${language === 'hi' ? 'Hindi' : 'English'}:\n\n${JSON.stringify(data)}`
  }[type];

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  const explanation = completion.choices[0]?.message?.content?.trim() || '';
  const result = { explanation };
  setCached(cacheKey, result);
  return result;
};

// 🌟 API: Generate Kundli chart via Prokerala API
app.post('/api/kundli', async (req, res) => {
  try {
    const { dob, time, latitude, longitude, timezone } = req.body;

    const params = new URLSearchParams({
      datetime: `${dob}T${time}+05:30`,
      coordinates: `${latitude},${longitude}`,
    });

    const response = await fetch(`https://api.prokerala.com/v2/astrology/chart?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${process.env.PROKERALA_ACCESS_TOKEN}`,
      },
    });

    const data = await response.json();
    return res.json({ data });
  } catch (error) {
    console.error('❌ Error fetching chart:', error);
    res.status(500).json({ error: 'Chart fetch failed.' });
  }
});

// 🌟 API: AI Explanation - Chart
app.post('/api/explain/chart', async (req, res) => {
  try {
    const result = await handleAIExplanation('chart', req.body.data, req.body.language);
    res.json(result);
  } catch (err) {
    console.error('❌ Chart AI error:', err);
    res.status(500).json({ error: 'Chart AI failed' });
  }
});

// 🌟 API: AI Explanation - Dasha
app.post('/api/explain/dasha', async (req, res) => {
  try {
    const result = await handleAIExplanation('dasha', req.body.data, req.body.language);
    res.json(result);
  } catch (err) {
    console.error('❌ Dasha AI error:', err);
    res.status(500).json({ error: 'Dasha AI failed' });
  }
});

// 🌟 API: AI Explanation - Yearly
app.post('/api/explain/yearly', async (req, res) => {
  try {
    const result = await handleAIExplanation('yearly', req.body.data, req.body.language);
    res.json(result);
  } catch (err) {
    console.error('❌ Yearly AI error:', err);
    res.status(500).json({ error: 'Yearly AI failed' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});








