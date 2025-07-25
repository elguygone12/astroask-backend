const fs = require('fs');
const path = require('path');
const manifestPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');

if (!fs.existsSync(manifestPath)) {
  console.error('❌ AndroidManifest.xml not found. Run `npx expo prebuild` first.');
  process.exit(1);
}

let manifest = fs.readFileSync(manifestPath, 'utf8');

// Check if already patched
if (manifest.includes('android:requestLegacyExternalStorage="true"')) {
  console.log('✅ Already patched.');
} else {
  // Add requestLegacyExternalStorage inside <application ...>
  manifest = manifest.replace(
    /<application\b([^>]+?)>/,
    `<application$1 android:requestLegacyExternalStorage="true">`
  );

  fs.writeFileSync(manifestPath, manifest, 'utf8');
  console.log('✅ Patched: android:requestLegacyExternalStorage="true" added.');
}
