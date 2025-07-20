// ✅ Polyfill fetch BEFORE OpenAI is imported
globalThis.fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// ✅ Then import the actual server
require('./server.js');

