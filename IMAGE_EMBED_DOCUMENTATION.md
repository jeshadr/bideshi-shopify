# Image and Video Embed Documentation

## Overview
This documentation describes how to embed images and videos in blog articles using shortcode syntax. Images support layout options and scaling, while videos are always centered.

---

## Image Embed Syntax

### Main Format
```
[[image:URL|LAYOUT|SCALE|CAPTION]]
```

**Note:** Image embeds use **double brackets** `[[...]]` to avoid conflicts with footnote references that use single brackets.

### Parameters
1. **URL** (required): The full URL to the image
2. **LAYOUT** (optional): One of `full`, `right`, `left`, or `center` (default: `full`)
3. **SCALE** (optional): A number to scale the image card size (default: `1` or 100%)
4. **CAPTION** (optional): Text description that appears below the image

---

## Image Examples

### Basic Image (Full Width)
```
[[image:https://example.com/image.jpg]]
```

### With Layout Only
```
[[image:https://example.com/image.jpg|right]]
[[image:https://example.com/image.jpg|left]]
[[image:https://example.com/image.jpg|center]]
```

### With Layout and Caption
```
[[image:https://example.com/image.jpg|right|Workers and elephants in Assam]]
[[image:https://example.com/image.jpg|left|Tea plantation in Darjeeling]]
[[image:https://example.com/image.jpg|center|Historic tea processing facility]]
```

### With Layout, Scale, and Caption
```
[[image:https://example.com/image.jpg|right|125|Workers and elephants in Assam]]
[[image:https://example.com/image.jpg|left|0.85|Tea plantation in Darjeeling]]
[[image:https://example.com/image.jpg|center|150|Historic tea processing facility]]
```

### With Scale Only (Full Width)
```
[[image:https://example.com/image.jpg|full|120|Large scaled image]]
```

### With Caption Only (No Layout/Scale)
```
[[image:https://example.com/image.jpg|||Simple caption without layout]]
```

---

## Scale Parameter

The scale parameter controls the size of the entire image card, including:
- The image itself
- The border around the image
- The caption text
- The padding

### Scale Value Rules
- **Numbers > 3**: Treated as percentages (e.g., `125` = 125% = 1.25x)
- **Numbers ≤ 3**: Treated as direct multipliers (e.g., `0.8` = 80%, `1.5` = 150%)
- **Default**: If omitted or invalid, scale defaults to `1` (100%)

### Scale Examples
```
[[image:https://example.com/image.jpg|right|75|Smaller image (75%)]]
[[image:https://example.com/image.jpg|left|120|Larger image (120%)]]
[[image:https://example.com/image.jpg|center|0.9|Slightly smaller (90%)]]
[[image:https://example.com/image.jpg|full|150|Much larger (150%)]]
```

---

## Layout Options

### For Images Only

| Layout | Description | Width | Max Width | Text Wrapping |
|--------|-------------|-------|-----------|---------------|
| `full` | Full-width (default) | 80% | 800px | No wrapping |
| `right` | Floats right | 45% | 500px | Text wraps on left |
| `left` | Floats left | 45% | 500px | Text wraps on right |
| `center` | Centered | 50% | 500px | No wrapping |

**Note:** On mobile devices (screens ≤749px), all layouts become full-width.

### Layout Behavior
- **`full`**: Image spans most of the content width, centered
- **`right`**: Image floats to the right side, text flows around it on the left
- **`left`**: Image floats to the left side, text flows around it on the right
- **`center`**: Image is centered with limited width, text appears above and below

---

## Video Embed Syntax

### Main Format
```
[video:URL|CAPTION]
```

**Note:** Videos use **single brackets** `[...]` (not double brackets like images).

### Parameters
1. **URL** (required): The full URL to the video
2. **CAPTION** (optional): Text description that appears below the video

### Supported Platforms
- **YouTube**: `youtube.com/watch?v=...`, `youtu.be/...`, `youtube.com/embed/...`
- **TikTok**: `tiktok.com/@username/video/...`

---

## Video Examples

### YouTube - Basic
```
[video:https://www.youtube.com/watch?v=example]
```

### YouTube - With Caption
```
[video:https://www.youtube.com/watch?v=example|Video: The History of Darjeeling Tea]
```

### YouTube - Short URL
```
[video:https://youtu.be/example]
```

### TikTok - Basic
```
[video:https://www.tiktok.com/@username/video/1234567890123456789]
```

### TikTok - With Caption
```
[video:https://www.tiktok.com/@username/video/1234567890123456789|TikTok: Tea Making Process]
```

---

## Video Layout Behavior

**Important:** Videos do NOT support layout options. They always appear:
- Centered on the page
- Full-width (up to 800px max)
- With 16:9 aspect ratio
- With text appearing above and below (no wrapping)

---

## Complete Examples

### Image with All Options
```
[[image:https://example.com/tea-plantation.jpg|right|110|Aerial view of Darjeeling tea gardens during harvest season]]
```
- Layout: Right-aligned, text wraps on left
- Scale: 110% (slightly larger than default)
- Caption: "Aerial view of Darjeeling tea gardens during harvest season"

### Scaled Full-Width Image
```
[[image:https://example.com/hero-image.jpg|full|150|Main feature image]]
```
- Layout: Full-width
- Scale: 150% (much larger)
- Caption: "Main feature image"

### Left-Floating Small Image
```
[[image:https://example.com/portrait.jpg|left|0.75|Portrait of tea picker]]
```
- Layout: Left-aligned, text wraps on right
- Scale: 75% (smaller)
- Caption: "Portrait of tea picker"

### Video with Caption
```
[video:https://www.youtube.com/watch?v=abc123|Documentary: The Art of Tea Making]
```

---

## Styling Details

### Image Cards
- **Border**: 2px solid black
- **Padding**: 12px (desktop), 8px (mobile)
- **Background**: #d9d9d9
- **Box Shadow**: Subtle shadow for depth
- **Caption Font**: ZTFormom (or Georgia fallback), serif
- **Caption Size**: Scales with the scale parameter

### Video Embeds
- **Border**: 2px solid rgba(0, 0, 0, 0.15)
- **Aspect Ratio**: 16:9 (maintained automatically)
- **Max Width**: 800px
- **TikTok**: Special styling with rounded corners and fixed dimensions

---

## Tips and Best Practices

1. **Use double brackets for images**: `[[image:...]]` to avoid conflicts with footnotes
2. **Use single brackets for videos**: `[video:...]`
3. **Scale values**: Use percentages (like `125`) for clarity, or decimals (like `1.25`) for precision
4. **Mobile responsiveness**: All layouts become full-width on mobile automatically
5. **Caption length**: Keep captions concise for better readability
6. **Image URLs**: Use full URLs (https://) for external images
7. **Video URLs**: YouTube and TikTok URLs are automatically converted to embed format

---

## Troubleshooting

### Image Not Appearing
- Check that you're using double brackets `[[image:...]]`
- Verify the URL is complete and accessible
- Ensure the URL ends before the closing brackets `]]`

### Scale Not Working
- Verify the scale value is numeric
- Check that scale is in the correct position (after layout, before caption)
- Remember: values > 3 are treated as percentages

### Layout Not Applying
- Confirm you're using a valid layout option: `full`, `right`, `left`, or `center`
- On mobile, all layouts become full-width (this is intentional)

### Video Not Embedding
- Ensure the URL is from YouTube or TikTok
- Check that the URL format is correct
- Verify you're using single brackets `[video:...]` (not double)

---

## Version History

- **Current Version**: Includes scale parameter support
- **Scale Feature**: Added ability to scale entire image cards (image, border, caption) using numeric values

