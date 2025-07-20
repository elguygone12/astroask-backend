globalThis.fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// After polyfilling fetch, start your server
require('./server');
