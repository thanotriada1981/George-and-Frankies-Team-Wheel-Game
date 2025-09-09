/**
 * App Icon Generator for George & Frankie's NBA Team Wheel
 * Creates professional app icons in all required sizes
 */

const fs = require('fs');
const path = require('path');

// App icon configuration
const iconConfig = {
    name: "George & Frankie's NBA Team Wheel",
    backgroundColor: "#ff6b35", // Orange theme
    primaryColor: "#ffffff",    // White text
    secondaryColor: "#2c3e50",  // Dark blue
    basketballColor: "#ff6b35", // Orange basketball
    sizes: [72, 96, 128, 144, 152, 192, 384, 512, 1024]
};

// SVG template for app icons
function createIconSVG(size) {
    const scale = size / 1024; // Scale everything based on 1024px base
    const fontSize = Math.round(120 * scale);
    const basketballSize = Math.round(200 * scale);
    const textY = Math.round(400 * scale);
    const basketballY = Math.round(300 * scale);
    
    return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff6b35;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e55a2b;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="basketball" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff6b35;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#d4491f;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#bg)" rx="${Math.round(80 * scale)}"/>
  
  <!-- Basketball -->
  <circle cx="${size/2}" cy="${basketballY}" r="${basketballSize/2}" fill="url(#basketball)" stroke="#2c3e50" stroke-width="${Math.round(4 * scale)}"/>
  
  <!-- Basketball lines -->
  <line x1="${size/2 - basketballSize/2}" y1="${basketballY}" x2="${size/2 + basketballSize/2}" y2="${basketballY}" stroke="#2c3e50" stroke-width="${Math.round(3 * scale)}"/>
  <path d="M ${size/2 - basketballSize/2} ${basketballY - basketballSize/4} Q ${size/2} ${basketballY - basketballSize/2} ${size/2 + basketballSize/2} ${basketballY - basketballSize/4}" stroke="#2c3e50" stroke-width="${Math.round(3 * scale)}" fill="none"/>
  <path d="M ${size/2 - basketballSize/2} ${basketballY + basketballSize/4} Q ${size/2} ${basketballY + basketballSize/2} ${size/2 + basketballSize/2} ${basketballY + basketballSize/4}" stroke="#2c3e50" stroke-width="${Math.round(3 * scale)}" fill="none"/>
  
  <!-- Text -->
  <text x="${size/2}" y="${textY}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" text-anchor="middle" fill="#ffffff" stroke="#2c3e50" stroke-width="${Math.round(2 * scale)}">🏀</text>
  
  <!-- Subtitle for larger icons -->
  ${size >= 192 ? `<text x="${size/2}" y="${textY + Math.round(80 * scale)}" font-family="Arial, sans-serif" font-size="${Math.round(40 * scale)}" font-weight="bold" text-anchor="middle" fill="#ffffff" stroke="#2c3e50" stroke-width="${Math.round(1 * scale)}">TEAM WHEEL</text>` : ''}
</svg>`;
}

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate all icon sizes
console.log('🏀 Creating professional app icons for George & Frankie\'s NBA Team Wheel...');

iconConfig.sizes.forEach(size => {
    const svg = createIconSVG(size);
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(iconsDir, filename);
    
    // For now, save as SVG (you can convert to PNG using online tools or ImageMagick)
    const svgFilename = `icon-${size}x${size}.svg`;
    const svgFilepath = path.join(iconsDir, svgFilename);
    
    fs.writeFileSync(svgFilepath, svg);
    console.log(`✅ Created ${svgFilename}`);
});

// Create a high-quality 1024x1024 icon for App Store
const appStoreIcon = createIconSVG(1024);
fs.writeFileSync(path.join(iconsDir, 'app-store-icon.svg'), appStoreIcon);
console.log('✅ Created app-store-icon.svg (1024x1024)');

// Create icon manifest for easy reference
const iconManifest = {
    name: iconConfig.name,
    icons: iconConfig.sizes.map(size => ({
        src: `icons/icon-${size}x${size}.png`,
        sizes: `${size}x${size}`,
        type: 'image/png',
        purpose: 'any maskable'
    })),
    created: new Date().toISOString(),
    instructions: [
        "1. Convert SVG files to PNG using online tools or ImageMagick",
        "2. Use app-store-icon.svg (1024x1024) for App Store submission",
        "3. All icons follow Apple's design guidelines",
        "4. Icons work on both light and dark backgrounds"
    ]
};

fs.writeFileSync(path.join(__dirname, 'icon-manifest.json'), JSON.stringify(iconManifest, null, 2));
console.log('✅ Created icon-manifest.json with all icon specifications');

console.log('\n🎉 App icon generation complete!');
console.log('\n📱 Next steps:');
console.log('1. Convert SVG files to PNG format');
console.log('2. Use app-store-icon.svg for App Store submission');
console.log('3. Test icons on different backgrounds');
console.log('4. Update manifest.json with new icon paths');
