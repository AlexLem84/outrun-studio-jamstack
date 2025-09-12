#!/bin/bash
# Fresh content download script for Outrun Studio JAMstack migration

set -e

echo "🚀 Starting fresh content download from outrunstudio.com..."
echo ""

# Configuration
WORDPRESS_URL="https://www.outrunstudio.com"
DATA_DIR="src/data"
IMAGES_DIR="public/images"

# Create directories
mkdir -p $DATA_DIR
mkdir -p $IMAGES_DIR

echo "📁 Created directories: $DATA_DIR, $IMAGES_DIR"

# Step 1: Download WordPress content via REST API
echo ""
echo "📰 Step 1: Downloading content from WordPress REST API..."

# Download pages
echo "  - Downloading pages..."
curl -s "$WORDPRESS_URL/wp-json/wp/v2/pages?per_page=100&_embed=true" > $DATA_DIR/pages.json

# Download posts (blog posts)
echo "  - Downloading blog posts..."
curl -s "$WORDPRESS_URL/wp-json/wp/v2/posts?per_page=100&_embed=true" > $DATA_DIR/posts.json

# Download media/images
echo "  - Downloading media metadata..."
curl -s "$WORDPRESS_URL/wp-json/wp/v2/media?per_page=100" > $DATA_DIR/media.json

# Download categories
echo "  - Downloading categories..."
curl -s "$WORDPRESS_URL/wp-json/wp/v2/categories" > $DATA_DIR/categories.json

echo "✅ Content download complete!"

# Step 2: Download images
echo ""
echo "🖼️  Step 2: Downloading images..."

# Get image URLs from media API and download them
echo "  - Extracting image URLs..."
jq -r '.[].source_url' $DATA_DIR/media.json | while read url; do
    if [ ! -z "$url" ]; then
        filename=$(basename "$url")
        echo "    Downloading: $filename"
        curl -s "$url" -o "$IMAGES_DIR/$filename" || echo "    Failed to download: $filename"
    fi
done

# Also download some key images we know exist
echo "  - Downloading key website images..."
key_images=(
    "logo-design-outrun-studio.png"
    "ROOF-RESCUE-IDAHO-FALLS-WEBSITE-DESIGN.jpg"
    "mccall-aviation-webpage-layout.jpg"
    "gem-state-cabinet-website.jpg"
    "Bouquet-la-vie-web-design.jpg"
    "Brand-Identity-1-scaled.jpg"
    "Digital-Illustrations-Outrun-Studio.png"
    "Visual-Marketing-Power.jpg"
    "Effective-Communication-scaled.jpg"
    "Graphic-Design.jpg"
    "Graphic-Design-Transforms-Business-Branding.jpg"
    "Stand-Out-in-a-Crowded-Market.jpg"
    "Visual-Marketing-Power-1.jpg"
    "Poster-Banner-brochures-and-signs​-Outrun-Studio.png"
    "Content-Strategy-scaled.webp"
    "Link-Building-scaled.webp"
    "Reputation-Data-Tools-scaled.webp"
    "Adobe-Express-Tools-scaled.jpg"
    "Screenshot-2025-08-04-at-4.20.26-PM.png"
)

for image in "${key_images[@]}"; do
    echo "    Downloading: $image"
    curl -s "$WORDPRESS_URL/wp-content/uploads/2025/08/$image" -o "$IMAGES_DIR/$image" || \
    curl -s "$WORDPRESS_URL/wp-content/uploads/2024/08/$image" -o "$IMAGES_DIR/$image" || \
    curl -s "$WORDPRESS_URL/wp-content/uploads/$image" -o "$IMAGES_DIR/$image" || \
    echo "    Failed to download: $image"
done

echo "✅ Image download complete!"

# Step 3: Show results
echo ""
echo "📊 Download Results:"
echo "===================="

# Count downloaded content
PAGES_COUNT=$(jq '. | length' $DATA_DIR/pages.json 2>/dev/null || echo "0")
POSTS_COUNT=$(jq '. | length' $DATA_DIR/posts.json 2>/dev/null || echo "0")
MEDIA_COUNT=$(jq '. | length' $DATA_DIR/media.json 2>/dev/null || echo "0")
IMAGES_DOWNLOADED=$(ls -1 $IMAGES_DIR 2>/dev/null | wc -l || echo "0")

echo "📄 Pages downloaded: $PAGES_COUNT"
echo "📰 Blog posts downloaded: $POSTS_COUNT"
echo "🖼️  Media items found: $MEDIA_COUNT"
echo "📥 Images downloaded: $IMAGES_DOWNLOADED"

echo ""
echo "🎉 Fresh content download completed successfully!"
echo ""
echo "Next steps:"
echo "1. Review downloaded content in '$DATA_DIR'"
echo "2. Check downloaded images in '$IMAGES_DIR'"
echo "3. Build the JAMstack website"
echo "4. Deploy to Vercel"
echo ""
