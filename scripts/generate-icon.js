const sharp = require("sharp");
const path = require("path");

const SIZE = 1024;
const HALF = SIZE / 2;

function createPokeBallSVG(size) {
  const half = size / 2;
  const bandHeight = size * 0.06;
  const centerRadius = size * 0.12;
  const innerRadius = size * 0.07;
  const outerRadius = size * 0.42;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <!-- Background gradient -->
    <radialGradient id="bg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#FF4B4B"/>
      <stop offset="100%" stop-color="#CC0000"/>
    </radialGradient>

    <!-- Top half gradient (red) -->
    <linearGradient id="topGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FF5252"/>
      <stop offset="60%" stop-color="#E53935"/>
      <stop offset="100%" stop-color="#C62828"/>
    </linearGradient>

    <!-- Bottom half gradient (white) -->
    <linearGradient id="bottomGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F5F5F5"/>
      <stop offset="100%" stop-color="#E0E0E0"/>
    </linearGradient>

    <!-- Center button gradient -->
    <radialGradient id="centerGrad" cx="45%" cy="40%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="50%" stop-color="#F0F0F0"/>
      <stop offset="100%" stop-color="#BDBDBD"/>
    </radialGradient>

    <!-- Shadow for depth -->
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.3"/>
    </filter>

    <!-- Inner shadow for center -->
    <filter id="innerShadow">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.2"/>
    </filter>

    <!-- Clip to circle -->
    <clipPath id="circleClip">
      <circle cx="${half}" cy="${half}" r="${outerRadius * size / size}"/>
    </clipPath>
  </defs>

  <!-- Rounded square background -->
  <rect width="${size}" height="${size}" rx="${size * 0.22}" ry="${size * 0.22}" fill="#DC2626"/>

  <!-- Subtle background pattern -->
  <rect width="${size}" height="${size}" rx="${size * 0.22}" ry="${size * 0.22}" fill="url(#bg)" opacity="0.3"/>

  <!-- Pokeball body -->
  <g filter="url(#shadow)">
    <!-- Top half (red) -->
    <path d="M ${half - outerRadius} ${half}
             A ${outerRadius} ${outerRadius} 0 0 1 ${half + outerRadius} ${half}
             L ${half - outerRadius} ${half} Z"
          fill="url(#topGrad)"/>

    <!-- Bottom half (white) -->
    <path d="M ${half - outerRadius} ${half}
             A ${outerRadius} ${outerRadius} 0 0 0 ${half + outerRadius} ${half}
             L ${half - outerRadius} ${half} Z"
          fill="url(#bottomGrad)"/>

    <!-- Outer circle stroke -->
    <circle cx="${half}" cy="${half}" r="${outerRadius}" fill="none" stroke="#212121" stroke-width="${size * 0.025}"/>

    <!-- Center band -->
    <rect x="${half - outerRadius}" y="${half - bandHeight / 2}"
          width="${outerRadius * 2}" height="${bandHeight}"
          fill="#303030"/>
  </g>

  <!-- Center button -->
  <g filter="url(#innerShadow)">
    <circle cx="${half}" cy="${half}" r="${centerRadius}" fill="#424242" stroke="#212121" stroke-width="${size * 0.015}"/>
    <circle cx="${half}" cy="${half}" r="${innerRadius}" fill="url(#centerGrad)" stroke="#9E9E9E" stroke-width="${size * 0.008}"/>
    <!-- Shine on button -->
    <ellipse cx="${half - innerRadius * 0.2}" cy="${half - innerRadius * 0.25}"
             rx="${innerRadius * 0.35}" ry="${innerRadius * 0.25}"
             fill="white" opacity="0.6"/>
  </g>

  <!-- Top shine/reflection -->
  <ellipse cx="${half - size * 0.06}" cy="${half - outerRadius * 0.55}"
           rx="${outerRadius * 0.35}" ry="${outerRadius * 0.15}"
           fill="white" opacity="0.25" transform="rotate(-15, ${half}, ${half - outerRadius * 0.5})"/>
</svg>`;
}

async function generateIcons() {
  const svg = createPokeBallSVG(SIZE);
  const svgBuffer = Buffer.from(svg);

  const outputDir = path.join(__dirname, "..", "assets", "images");

  // Main icon (1024x1024)
  await sharp(svgBuffer)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(outputDir, "icon.png"));
  console.log("Generated icon.png (1024x1024)");

  // Adaptive icon foreground (with padding for Android safe zone)
  const foregroundSvg = createPokeBallSVG(SIZE);
  await sharp(Buffer.from(foregroundSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(outputDir, "android-icon-foreground.png"));
  console.log("Generated android-icon-foreground.png");

  // Adaptive icon background
  const bgSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#FF4B4B"/>
      <stop offset="100%" stop-color="#CC0000"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" fill="#DC2626"/>
  <rect width="1024" height="1024" fill="url(#bg)" opacity="0.3"/>
</svg>`;
  await sharp(Buffer.from(bgSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(outputDir, "android-icon-background.png"));
  console.log("Generated android-icon-background.png");

  // Monochrome icon for Android 13+
  const monoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  ${(() => {
    const outerRadius = SIZE * 0.42;
    const bandHeight = SIZE * 0.06;
    const centerRadius = SIZE * 0.12;
    const innerRadius = SIZE * 0.07;
    return `
    <circle cx="${HALF}" cy="${HALF}" r="${outerRadius}" fill="none" stroke="black" stroke-width="${SIZE * 0.025}"/>
    <path d="M ${HALF - outerRadius} ${HALF}
             A ${outerRadius} ${outerRadius} 0 0 1 ${HALF + outerRadius} ${HALF}
             L ${HALF - outerRadius} ${HALF} Z"
          fill="black" opacity="0.3"/>
    <rect x="${HALF - outerRadius}" y="${HALF - bandHeight / 2}"
          width="${outerRadius * 2}" height="${bandHeight}"
          fill="black"/>
    <circle cx="${HALF}" cy="${HALF}" r="${centerRadius}" fill="black"/>
    <circle cx="${HALF}" cy="${HALF}" r="${innerRadius}" fill="white"/>
    `;
  })()}
</svg>`;
  await sharp(Buffer.from(monoSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(outputDir, "android-icon-monochrome.png"));
  console.log("Generated android-icon-monochrome.png");

  // Splash icon
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, "splash-icon.png"));
  console.log("Generated splash-icon.png (512x512)");

  // Favicon
  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.join(outputDir, "favicon.png"));
  console.log("Generated favicon.png (48x48)");

  console.log("\nAll icons generated successfully!");
}

generateIcons().catch(console.error);
