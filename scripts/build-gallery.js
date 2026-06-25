const fs = require('fs');
const path = require('path');

const GALLERY_DIR = path.join(__dirname, '..', 'images', 'gallery');
const INDEX_HTML = path.join(__dirname, '..', 'index.html');
const GALLERY_HTML = path.join(__dirname, '..', 'gallery.html');

function buildGallery() {
    console.log('Scanning gallery directory:', GALLERY_DIR);
    
    if (!fs.existsSync(GALLERY_DIR)) {
        console.error('Gallery directory does not exist!');
        return;
    }

    // Read and filter images
    const files = fs.readdirSync(GALLERY_DIR);
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    
    const images = files
        .filter(file => validExtensions.includes(path.extname(file).toLowerCase()))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
        .map(file => {
            const ext = path.extname(file);
            const baseName = path.basename(file, ext);
            
            // Detect wide layout from filename
            const isWide = baseName.toLowerCase().endsWith('-wide');
            
            // Clean title for caption
            let title = baseName;
            if (isWide) {
                title = title.substring(0, title.length - 5); // remove "-wide"
            }
            
            // Convert to title case
            const caption = title
                .replace(/[-_]/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase());
                
            return {
                name: file,
                wide: isWide,
                caption: caption
            };
        });

    console.log(`Found ${images.length} gallery images.`);

    if (images.length === 0) {
        console.warn('No images found in gallery folder.');
    }

    // Generate HTML for gallery.html (All images)
    const galleryHtmlSegment = images.map(img => {
        const wideClass = img.wide ? ' gallery-item--wide' : '';
        return `                    <div class="gallery-item${wideClass}" onclick="openLightbox('images/gallery/${img.name}', '${img.caption}')">
                        <img src="images/gallery/${img.name}" alt="${img.caption} - Ultra Pro Packers and Movers" loading="lazy">
                        <div class="gallery-item-overlay">
                            <span class="gallery-item-name">${img.caption}</span>
                        </div>
                    </div>`;
    }).join('\n');

    // Generate HTML for index.html (Preview: up to 4 images, shuffled or first 4)
    // We take the first 4 images to keep the ordering predictable for the owner
    const previewImages = images.slice(0, 4);
    const indexHtmlSegment = previewImages.map(img => {
        const wideClass = img.wide ? ' gallery-item--wide' : '';
        return `                    <div class="gallery-item${wideClass}" onclick="openLightbox('images/gallery/${img.name}', '${img.caption}')">
                        <img src="images/gallery/${img.name}" alt="${img.caption} - Ultra Pro Packers and Movers" loading="lazy">
                        <div class="gallery-item-overlay">
                            <span class="gallery-item-name">${img.caption}</span>
                        </div>
                    </div>`;
    }).join('\n');

    // Helper to replace content between comment place markers
    function replaceMarkers(filePath, segmentHtml) {
        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${filePath}`);
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        const startMarker = '<!-- DYNAMIC_GALLERY_START -->';
        const endMarker = '<!-- DYNAMIC_GALLERY_END -->';

        const startIndex = content.indexOf(startMarker);
        const endIndex = content.indexOf(endMarker);

        if (startIndex === -1 || endIndex === -1) {
            console.error(`Markers not found in file: ${filePath}`);
            return;
        }

        const newContent = 
            content.substring(0, startIndex + startMarker.length) + 
            '\n' + segmentHtml + '\n' + 
            content.substring(endIndex);

        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Successfully updated: ${filePath}`);
    }

    // Update files
    replaceMarkers(INDEX_HTML, indexHtmlSegment);
    replaceMarkers(GALLERY_HTML, galleryHtmlSegment);
    console.log('Gallery generation complete.');
}

buildGallery();
