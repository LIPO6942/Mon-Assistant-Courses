const sharp = require('sharp');
const path = require('path');

async function generateMaskableIcon(inputPath, outputPath, size) {
  // For maskable icons, the safe zone is the inner 80% circle
  // So we need ~20% padding on each side (10% each side = 20% total)
  // We'll use 18% padding on each side to keep the cart nicely centered
  const padding = Math.round(size * 0.18);
  const innerSize = size - (padding * 2);

  // Read the original icon and resize it to fit within the safe zone
  const resizedIcon = await sharp(inputPath)
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();

  // Create a white canvas of the target size and composite the resized icon centered
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([{
      input: resizedIcon,
      left: padding,
      top: padding
    }])
    .png()
    .toFile(outputPath);

  console.log(`✅ Generated ${outputPath} (${size}x${size}) with ${padding}px padding`);
}

async function main() {
  const publicDir = path.join(__dirname, 'public');
  const sourceIcon = path.join(publicDir, 'icon-512x512.png');

  // Generate maskable icons with proper safe zone padding
  await generateMaskableIcon(sourceIcon, path.join(publicDir, 'icon-maskable-192x192.png'), 192);
  await generateMaskableIcon(sourceIcon, path.join(publicDir, 'icon-maskable-512x512.png'), 512);

  console.log('\n🎉 Maskable icons generated successfully!');
  console.log('The cart is now centered within the safe zone for adaptive icons.');
}

main().catch(console.error);
