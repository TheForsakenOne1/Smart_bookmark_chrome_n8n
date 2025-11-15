#!/usr/bin/env python3
"""
Generate icons for the Smart Bookmark Classifier extension
"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("PIL/Pillow not installed. Installing...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
    from PIL import Image, ImageDraw, ImageFont

import os

# Icon sizes
SIZES = [16, 48, 128]

# Colors (gradient purple to blue)
BG_COLOR = (102, 126, 234)  # #667eea
TEXT_COLOR = (255, 255, 255)  # white

def create_icon(size):
    """Create an icon of the specified size"""
    # Create image with background color
    img = Image.new('RGBA', (size, size), BG_COLOR + (255,))
    draw = ImageDraw.Draw(img)

    # Calculate font size (relative to icon size)
    font_size = int(size * 0.5)

    # Try to use a nice font, fallback to default
    try:
        # Try to find a system font
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", font_size)
        except:
            # Use default font
            font = ImageFont.load_default()

    # Draw text (bookmark icon emoji or "SB" for Smart Bookmarks)
    text = "📚"

    # For smaller sizes, use text instead of emoji
    if size < 32:
        text = "SB"

    # Get text bounding box
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Center text
    x = (size - text_width) // 2 - bbox[0]
    y = (size - text_height) // 2 - bbox[1]

    # Draw text
    draw.text((x, y), text, fill=TEXT_COLOR, font=font)

    return img

def main():
    """Generate all icon sizes"""
    # Create icons directory if it doesn't exist
    icons_dir = os.path.join(os.path.dirname(__file__), 'icons')
    os.makedirs(icons_dir, exist_ok=True)

    print("Generating extension icons...")

    for size in SIZES:
        icon = create_icon(size)
        filename = os.path.join(icons_dir, f'icon{size}.png')
        icon.save(filename, 'PNG')
        print(f"✓ Created {filename}")

    print("\nAll icons generated successfully!")

if __name__ == '__main__':
    main()
