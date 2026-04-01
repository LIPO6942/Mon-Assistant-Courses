const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateIcon({ inputPath, outputPath, size, paddingFactor = 0.1, backgroundColor = { r: 255, g: 255, b: 255, alpha: 1 } }) {
  const padding = Math.round(size * paddingFactor);
  const innerSize = size - (padding * 2);

  // Read the original icon and resize it
  const resizedIcon = await sharp(inputPath)
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // Create canvas and composite
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: backgroundColor
    }
  })
    .composite([{
      input: resizedIcon,
      left: padding,
      top: padding
    }])
    .png()
    .toFile(outputPath);

  console.log(`✅ Generated ${outputPath} (${size}x${size})`);
}

async function main() {
  const publicDir = path.join(__dirname, 'public');
  const sourceIcon = path.join(publicDir, 'source-cart.png');

  if (!fs.existsSync(sourceIcon)) {
    console.error(`Error: Source icon not found at ${sourceIcon}`);
    process.exit(1);
  }

  // Standard icons (10% padding for better look)
  await generateIcon({ inputPath: sourceIcon, outputPath: path.join(publicDir, 'icon-192x192.png'), size: 192, paddingFactor: 0.15 });
  await generateIcon({ inputPath: sourceIcon, outputPath: path.join(publicDir, 'icon-512x512.png'), size: 512, paddingFactor: 0.15 });

  // Maskable icons (Requires at least 10% safe zone padding, we use 18% for safety/aesthetics)
  await generateIcon({ inputPath: sourceIcon, outputPath: path.join(publicDir, 'icon-maskable-192x192.png'), size: 192, paddingFactor: 0.2 });
  await generateIcon({ inputPath: sourceIcon, outputPath: path.join(publicDir, 'icon-maskable-512x512.png'), size: 512, paddingFactor: 0.2 });

  // Splash screen icon (Maybe larger with more padding)
  await generateIcon({ inputPath: sourceIcon, outputPath: path.join(publicDir, 'splash-icon.png'), size: 512, paddingFactor: 0.25 });

  console.log('\n🎉 All icons generated successfully with centered chariot on white background!');
}

main().catch(console.error);
