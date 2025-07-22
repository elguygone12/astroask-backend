import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import crypto from 'crypto';
import { fetch, Headers } from 'undici';
import { FormData } from 'formdata-node';
import Blob from 'fetch-blob';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

globalThis.fetch = fetch;
globalThis.Headers = Headers;
globalThis.FormData = FormData;
globalThis.Blob = Blob;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

if (!process.env.OPENAI_API_KEY || !process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
  throw new Error('❌ Missing required .env variables: OPENAI_API_KEY, CLIENT_ID, CLIENT_SECRET');
}

app.use(cors());
app.use(bodyParser.json());

console.log('🔑 Loaded OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY);

// 🗃️ Create cache dir if not exists
const cacheDir = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

// 🧾 Utility: Create cache file path
function getCacheFilePath(type, data) {
  const hash = crypto.createHash('sha256').update(JSON.stringify({ type, data })).digest('hex');
  return path.join(cacheDir, `${type}_${hash}.json`);
}

// 🔐 Get Prokerala access token
async function getProkeralaAccessToken() {
  try {
    const response = await axios.post(
      'https://api.prokerala.com/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
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

  if (!dob || !time || !latitude || !longitude) {
    return res.status(400).json({ error: 'Missing required fields (dob, time, latitude, longitude)' });
  }

  try {
    const token = await getProkeralaAccessToken();
    const tz = timezone || '+05:30';
    const datetime = `${dob}T${time}:00${tz}`;
    const coordinates = `${parseFloat(latitude).toFixed(2)},${parseFloat(longitude).toFixed(2)}`;
    const ayanamsa = 1;

    const response = await axios.get('https://api.prokerala.com/v2/astrology/birth-details', {
      params: { datetime, coordinates, timezone: tz, ayanamsa },
      headers: { Authorization: `Bearer ${token}` },
    });

    res.json({ data: response.data });
  } catch (err) {
    console.error('❌ Prokerala error:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

// 🔮 AI Explanation Endpoints
app.post('/api/explain/chart', async (req, res) => {
  await handleAIExplanation(req, res, 'chart');
});
app.post('/api/explain/dasha', async (req, res) => {
  await handleAIExplanation(req, res, 'dasha');
});
app.post('/api/explain/yearly', async (req, res) => {
  await handleAIExplanation(req, res, 'yearly');
});

// 💡 GPT Explanation Logic (axios version)
async function handleAIExplanation(req, res, type) {
  const { data, language = 'en' } = req.body;
  const filePath = getCacheFilePath(type, { data, language });

  if (fs.existsSync(filePath)) {
    const cached = fs.readFileSync(filePath, 'utf-8');
    return res.json(JSON.parse(cached));
  }

  const langName = language === 'hi' ? 'Hindi' : 'English';
  let prompt = '';

  if (type === 'chart') {
    prompt = `You're a skilled Vedic astrologer. Based on the birth chart below, give a long, detailed, paragraph-style explanation in ${langName}. Focus on nakshatra, planetary influences, yogas, and rashi. Do NOT mention coordinates, time zone, or the location Delhi anywhere.\n\nBirth chart data:\n${JSON.stringify(data, null, 2)}`;
  } else if (type === 'dasha') {
    prompt = `You're a skilled Vedic astrologer. Based on the following birth data, simulate a detailed Vimshottari Dasha period interpretation in ${langName}. Focus on the effects of planetary periods on career, relationships, and health. Keep it in paragraph form. Do NOT mention coordinates, time zone, or the location Delhi.\n\nBirth chart data:\n${JSON.stringify(data, null, 2)}`;
  } else if (type === 'yearly') {
    prompt = `You are a Vedic astrologer. Based on the following birth chart, give a long and insightful yearly prediction in ${langName}. Use paragraph format and do NOT include coordinates, timezone, or mention Delhi in any way.\n\nBirth chart data:\n${JSON.stringify(data, null, 2)}`;
  }

  try {
    const aiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const explanation = aiResponse.data.choices?.[0]?.message?.content?.trim() || 'No explanation generated.';
    const result = { explanation };
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`📩 AI Explanation (${type}) generated.`);
    res.json(result);
  } catch (err) {
    console.error(`❌ ${type} AI error:`, err?.response?.data || err.message);
    res.status(500).json({ error: 'AI explanation failed' });
  }
}

// ✅ /test-gpt route using axios
app.get('/test-gpt', async (req, res) => {
  try {
    console.log('🚀 /test-gpt route triggered');

    const aiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Say hello!' }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ message: aiResponse.data.choices?.[0]?.message?.content });
  } catch (err) {
    console.error('❌ GPT Test Error:', err?.response?.data || err.message);
    res.status(500).json({ error: 'OpenAI test failed' });
  }
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});




















