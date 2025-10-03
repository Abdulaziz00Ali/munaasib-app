const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');

// Define directories
const originalImagesDir = path.join(__dirname, '..', 'public', 'halls and kitchens images');
const optimizedImagesDir = path.join(__dirname, '..', 'public', 'optimized-images');

// Create directories if they don't exist
if (!fs.existsSync(originalImagesDir)) {
    fs.mkdirSync(originalImagesDir, { recursive: true });
}

if (!fs.existsSync(optimizedImagesDir)) {
    fs.mkdirSync(optimizedImagesDir, { recursive: true });
}

// Helper function to convert string to kebab case
function toKebabCase(str) {
    return str.toLowerCase().replace(/[\s_]+/g, '-');
}

// Helper function to sanitize folder names
function sanitizeFolderName(name) {
    return name.replace(/[\/:*?"<>|]/g, '');
}

// Download image with retry mechanism
async function downloadImage(url, filepath, maxRetries = 3) {
    let retries = 0;
    
    while (retries < maxRetries) {
        try {
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'stream',
                timeout: 10000 // 10 seconds timeout
            });
            
            return new Promise((resolve, reject) => {
                response.data.pipe(fs.createWriteStream(filepath))
                    .on('finish', () => resolve(true))
                    .on('error', (e) => reject(e));
            });
        } catch (error) {
            retries++;
            console.error(`Attempt ${retries}/${maxRetries} failed for ${url}: ${error.message}`);
            
            if (retries >= maxRetries) {
                throw new Error(`Failed to download image after ${maxRetries} attempts: ${error.message}`);
            }
            
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
        }
    }
}

// Process image with sharp for optimization and WebP conversion
async function processImage(inputPath, outputFolder, filename) {
    try {
        // Create output folder if it doesn't exist
        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder, { recursive: true });
        }
        
        // Original optimized JPEG
        const jpgOutputPath = path.join(outputFolder, filename);
        await sharp(inputPath)
            .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80, progressive: true })
            .toFile(jpgOutputPath);
        
        // WebP version
        const webpFilename = filename.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        const webpOutputPath = path.join(outputFolder, webpFilename);
        await sharp(inputPath)
            .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 75 })
            .toFile(webpOutputPath);
            
        console.log(`Processed ${filename} to JPEG and WebP formats`);
        return { jpg: jpgOutputPath, webp: webpOutputPath };
    } catch (error) {
        console.error(`Error processing image ${inputPath}: ${error.message}`);
        throw error;
    }
}

// Main function to process venues
async function main() {
    try {
        // Read venue data files
        const hallsFileContent = fs.readFileSync(
            path.join(__dirname, '..', 'src', 'data', 'updatedHalls.ts'), 
            'utf-8'
        );
        
        const kitchensFileContent = fs.readFileSync(
            path.join(__dirname, '..', 'src', 'data', 'updatedKitchens.ts'), 
            'utf-8'
        );
        
        // Extract venue information using regex
        const venueRegex = /{
\s*"id":\s*"[^"]+",\s*"name":\s*"([^"]+)",[\s\S]*?"googleMapsUrl":\s*"([^"]+)"/g;
        
        const venues = [];
        let match;
        
        // Process halls
        while ((match = venueRegex.exec(hallsFileContent)) !== null) {
            venues.push({
                name: match[1],
                googleMapsUrl: match[2],
                category: 'halls'
            });
        }
        
        // Reset regex lastIndex
        venueRegex.lastIndex = 0;
        
        // Process kitchens
        while ((match = venueRegex.exec(kitchensFileContent)) !== null) {
            venues.push({
                name: match[1],
                googleMapsUrl: match[2],
                category: 'kitchens'
            });
        }
        
        console.log(`Found ${venues.length} venues to process`);
        
        // Launch browser
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Set user agent to avoid detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Process each venue
        for (const venue of venues) {
            try {
                console.log(`Processing ${venue.name}...`);
                
                // Create sanitized folder name
                const folderName = sanitizeFolderName(venue.name);
                
                // Create folders for original and optimized images
                const originalVenueFolder = path.join(originalImagesDir, folderName);
                const optimizedVenueFolder = path.join(optimizedImagesDir, folderName);
                
                if (!fs.existsSync(originalVenueFolder)) {
                    fs.mkdirSync(originalVenueFolder, { recursive: true });
                }
                
                if (!fs.existsSync(optimizedVenueFolder)) {
                    fs.mkdirSync(optimizedVenueFolder, { recursive: true });
                }
                
                // Navigate to Google Maps URL
                await page.goto(venue.googleMapsUrl, { 
                    waitUntil: 'networkidle2', 
                    timeout: 60000 
                });
                
                // Wait for images to load
                await page.waitForTimeout(2000);
                
                // Extract image URLs
                const images = await page.evaluate(() => {
                    const imageElements = Array.from(document.querySelectorAll('img'));
                    return imageElements
                        .map(img => img.src)
                        .filter(src => 
                            src && 
                            (src.includes('googleusercontent.com') || 
                             src.includes('maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto'))
                        );
                });
                
                console.log(`Found ${images.length} images for ${venue.name}`);
                
                // Download and process images (up to 5 per venue)
                let imageCount = 0;
                for (let i = 0; i < images.length && imageCount < 5; i++) {
                    const imageUrl = images[i];
                    
                    try {
                        // Generate filenames
                        const filename = imageCount === 0 ? 
                            'unnamed.jpg' : 
                            `unnamed (${imageCount}).jpg`;
                            
                        const originalFilepath = path.join(originalVenueFolder, filename);
                        
                        // Skip if file already exists
                        if (fs.existsSync(originalFilepath)) {
                            console.log(`Skipping existing file: ${originalFilepath}`);
                            
                            // Process existing file if optimized version doesn't exist
                            const optimizedJpgPath = path.join(optimizedVenueFolder, filename);
                            const optimizedWebpPath = path.join(
                                optimizedVenueFolder, 
                                filename.replace(/\.(jpg|jpeg|png)$/i, '.webp')
                            );
                            
                            if (!fs.existsSync(optimizedJpgPath) || !fs.existsSync(optimizedWebpPath)) {
                                await processImage(originalFilepath, optimizedVenueFolder, filename);
                            }
                            
                            imageCount++;
                            continue;
                        }
                        
                        // Download image
                        console.log(`Downloading ${imageUrl} to ${originalFilepath}...`);
                        await downloadImage(imageUrl, originalFilepath);
                        
                        // Process image
                        await processImage(originalFilepath, optimizedVenueFolder, filename);
                        
                        imageCount++;
                    } catch (error) {
                        console.error(`Error processing image ${imageUrl}: ${error.message}`);
                        // Continue with next image
                    }
                }
                
                // If no images were found or downloaded, create a placeholder
                if (imageCount === 0) {
                    console.log(`No images found for ${venue.name}, creating placeholder`);
                    
                    // Copy placeholder image
                    const placeholderSrc = path.join(__dirname, '..', 'public', 'placeholder.svg');
                    const placeholderDest = path.join(originalVenueFolder, 'placeholder.svg');
                    
                    if (fs.existsSync(placeholderSrc)) {
                        fs.copyFileSync(placeholderSrc, placeholderDest);
                    }
                }
            } catch (venueError) {
                console.error(`Error processing venue ${venue.name}: ${venueError.message}`);
                // Continue with next venue
            }
        }
        
        await browser.close();
        console.log('Image processing completed successfully!');
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

// Run the main function
main();