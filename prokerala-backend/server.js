import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import crypto from 'crypto';
import { OpenAI } from 'openai';
import { fetch, Headers } from 'undici';
import { FormData } from 'formdata-node';
import Blob from 'fetch-blob';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 👇 Needed for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🌍 Polyfill globals
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

// 🧠 Setup OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

// 💡 GPT Explanation Logic (with file-based cache)
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

    const explanation = aiResponse.choices?.[0]?.message?.content?.trim() || 'No explanation generated.';
    const result = { explanation };
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`📩 AI Explanation (${type}) generated.`);
    res.json(result);
  } catch (err) {
    console.error(`❌ ${type} AI error:`, err?.response?.data || err.message);
    res.status(500).json({ error: 'AI explanation failed' });
  }
}

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
















