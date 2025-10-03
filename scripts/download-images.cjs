const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const downloadDir = path.join(__dirname, '..', 'public', 'images', 'places');

if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
}

// Align with UI slug rules: keep Arabic and alphanumerics, convert others to '-', collapse, and trim
function toKebabCase(str) {
  return (str || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$|\.+$/g, '');
}

async function downloadImage(url, filepath) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        timeout: 15000,
    });
    return new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(filepath))
            .on('finish', () => resolve(true))
            .on('error', (e) => reject(e));
    });
}

// Simple sleep helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
    const kitchensFileContent = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'updatedKitchens.ts'), 'utf-8');
    
    const kitchenRegex = /\{\s*\"id\":\s*\"[^\"]+\",\s*\"name\":\s*\"([^\"]+)\",[\s\S]*?\"googleMapsUrl\":\s*\"([^\"]+)\"/g;
    
    let match;
    const kitchens = [];
    while ((match = kitchenRegex.exec(kitchensFileContent)) !== null) {
        kitchens.push({
            name: match[1],
            googleMapsUrl: match[2]
        });
    }

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    for (const kitchen of kitchens) {
        try {
            console.log(`Processing ${kitchen.name}...`);
            await page.goto(kitchen.googleMapsUrl, { waitUntil: 'networkidle2', timeout: 60000 });
            await sleep(2000);

            const images = await page.evaluate(() => {
                const imageElements = Array.from(document.querySelectorAll('img'));
                return imageElements.map(img => img.src);
            });

            const seen = new Set();
            let imageCount = 0;
            for (let i = 0; i < images.length && imageCount < 3; i++) {
                const imageUrl = images[i];
                if (!imageUrl || seen.has(imageUrl)) continue;
                seen.add(imageUrl);

                // Broaden URL patterns to include common Google Maps/Photos domains
                const isCandidate = (
                    imageUrl.includes('googleusercontent.com') ||
                    imageUrl.includes('ggpht.com') ||
                    imageUrl.includes('PhotoService.GetPhoto') ||
                    imageUrl.includes('/maps/api/place/')
                );
                if (!isCandidate) continue;

                const placeNameKebab = toKebabCase(kitchen.name);
                const filename = `${placeNameKebab}-${imageCount + 1}.jpg`;
                const filepath = path.join(downloadDir, filename);

                if (!fs.existsSync(filepath)) {
                    try {
                        console.log(`Downloading ${imageUrl} to ${filepath}...`);
                        await downloadImage(imageUrl, filepath);
                        imageCount++;
                    } catch (error) {
                        console.error(`Failed to download ${imageUrl}:`, error.message || error);
                    }
                } else {
                    console.log(`Skipping existing file: ${filepath}`);
                    imageCount++;
                }
            }
        } catch (err) {
            console.error(`Error processing ${kitchen.name}:`, err.message || err);
        }
    }

    await browser.close();
}

main();
