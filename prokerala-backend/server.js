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

// 💡 GPT Explanation Logic
async function handleAIExplanation(req, res, type) {
  const { data, language = 'en' } = req.body;
  const filePath = getCacheFilePath(type, { data, language });

  if (fs.existsSync(filePath)) {
    const cached = fs.readFileSync(filePath, 'utf-8');
    return res.json(JSON.parse(cached));
  }

  const isHindi = language === 'hi';
  let prompt = '';
  let maxTokens = 1500;

  if (type === 'chart') {
    maxTokens = 1800;
    prompt = isHindi
      ? `आप एक कुशल वैदिक ज्योतिषी हैं। नीचे दिए गए जन्म कुंडली डेटा के आधार पर एक लंबा, विस्तृत और पैराग्राफ-शैली में हिंदी में ज्योतिषीय विश्लेषण दें। कृपया नक्षत्र, ग्रहों का प्रभाव, योग और राशि के आधार पर व्याख्या करें। स्थान, समय क्षेत्र या दिल्ली का कोई उल्लेख न करें।

${JSON.stringify(data, null, 2)}`
      : `You're a skilled Vedic astrologer. Based on the birth chart below, give a long, detailed, paragraph-style explanation in English. Focus on nakshatra, planetary influences, yogas, and rashi. Do NOT mention coordinates, time zone, or the location Delhi anywhere. Use paragraph format.

Birth chart data:
${JSON.stringify(data, null, 2)}`;
  } else if (type === 'dasha') {
    maxTokens = 2000;
    prompt = isHindi
      ? `आप एक अत्यंत अनुभवी वैदिक ज्योतिषी हैं। कृपया नीचे दिए गए जन्म डेटा के आधार पर एक अत्यंत विस्तृत और गहराई से विश्लेषण करें कि विभिन्न ग्रहों की दशाएं व्यक्ति के जीवन के किन-किन क्षेत्रों (जैसे करियर, स्वास्थ्य, धन, वैवाहिक जीवन, पारिवारिक संबंध और मानसिक स्थिति) को कैसे प्रभावित करेंगी। व्याख्या पैराग्राफ शैली में दें, और कृपया स्थान, समय क्षेत्र या दिल्ली का कोई उल्लेख न करें। व्याख्या हिंदी में होनी चाहिए और बहुत ही पेशेवर तथा सटीक होनी चाहिए।

जन्म डेटा:
${JSON.stringify(data, null, 2)}`
      : `You are a highly experienced Vedic astrologer. Based on the following birth data, provide a comprehensive, detailed analysis of the Vimshottari Dasha system. Divide the explanation into sections with headings like "Career", "Health", "Wealth", "Relationships", and use HTML-like tags such as <health>, <career>, etc. The explanation must be professional and Do NOT include coordinates, timezone, or mention Delhi in any way. Write in paragraph format.

Birth chart data:
${JSON.stringify(data, null, 2)}`;
  } else if (type === 'yearly') {
    maxTokens = 1800;
    prompt = isHindi
      ? `आप एक वैदिक ज्योतिषी हैं। नीचे दिए गए कुंडली डेटा के आधार पर आगामी वर्ष का विस्तृत और गहराई से विश्लेषण करें। कृपया पैराग्राफ शैली में लिखें और स्थान, समय क्षेत्र या दिल्ली का उल्लेख न करें।

${JSON.stringify(data, null, 2)}`
      : `You are a Vedic astrologer. Based on the following birth chart, give a long and insightful yearly prediction in English. Use paragraph format and divide explanation using sections like <career>, <health>, <relationships> etc. Do NOT include coordinates, timezone, or mention Delhi in any way.

Birth chart data:
${JSON.stringify(data, null, 2)}`;
  }

  try {
    const aiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.9,
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























