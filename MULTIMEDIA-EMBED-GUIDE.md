# Multimedia Embed Guide

This guide explains how to embed images, videos, and other media in your blog articles with different layout options.

## Image Syntax

### Direct Image Links (NEW!)
You can now use direct image URLs instead of metafields:

**Basic:**
```
[image:https://example.com/image.jpg]
```

**With layout:**
```
[image:https://example.com/image.jpg|right]
[image:https://example.com/image.jpg|left]
```

**With layout and caption:**
```
[image:https://example.com/image.jpg|right|Workers and elephants in Assam]
[image:https://example.com/image.jpg|left|Tea plantation in Darjeeling]
```

### Metafield Images

**Basic Syntax (Full-width)**
```
[media-image-1]
```
- Takes up full width of the article
- Default behavior if no layout is specified

### Float Right with Caption
```
[media-image-2|right|Workers and elephants used for clearing land and transporting tea in Assam during the 19th century.]
```
- Image floats to the right
- Text wraps around on the left
- Caption appears below the image

### Float Left with Caption
```
[media-image-3|left|Tea plantation in Darjeeling]
```
- Image floats to the left
- Text wraps around on the right
- Caption appears below the image

### Centered with Caption
```
[media-image-4|center|Video: The History of Darjeeling Tea]
```
- Image is centered with limited width (60% of article width)
- Caption appears below
- Good for portrait images or smaller images

### Full-width with Caption
```
[media-image-1|full|Darjeeling Tea in the Himalayas]
```
- Full-width image with a caption below

## Video Embed Syntax

### Direct Video Links (NEW!)
You can now use direct video URLs (YouTube and TikTok):

**YouTube - Basic:**
```
[video:https://www.youtube.com/watch?v=example]
```

**YouTube - Short URL:**
```
[video:https://youtu.be/example]
```

**YouTube - With caption:**
```
[video:https://www.youtube.com/watch?v=example|Video: The History of Darjeeling Tea]
```

**TikTok - Basic:**
```
[video:https://www.tiktok.com/@username/video/1234567890123456789]
```

**TikTok - With caption:**
```
[video:https://www.tiktok.com/@username/video/1234567890123456789|TikTok: Tea Making Process]
```

### Metafield Videos

**Basic:**
```
[media-link-1]
```

**With caption:**
```
[media-link-1|Video: Tea Processing Methods]
```

**Note:** Videos do NOT support layout options (no left, right, center). They always appear in the default centered position.

## Layout Options

**For Images Only:**
- **`full`** - Full-width (default)
- **`right`** - Floats right, text wraps on left (35% width, max 400px)
- **`left`** - Floats left, text wraps on right (35% width, max 400px)
- **`center`** - Centered with limited width (50% width, max 500px)

**For Videos:**
- Videos do NOT support layout options - they always appear in the default centered position

## How to Use

### Option 1: Direct Image Links (Easiest!)
Simply paste the image URL directly in your content:
```
[image:https://example.com/photo.jpg|right|Caption text]
[image:https://example.com/photo.jpg|left|Caption text]
```

### Option 2: Metafield Images
1. **Upload media** to your Shopify article metafields:
   - `media_image` - for images
   - `media_video_link` - for YouTube/Vimeo links
   - `media_audio` - for audio files
   - `media_video` - for uploaded videos

2. **Insert shortcodes** in your article content using the format:
   ```
   [media-TYPE-INDEX|LAYOUT|CAPTION]
   ```
   
   Or for direct image links:
   ```
   [image:URL|LAYOUT|CAPTION]
   ```
   
   Or for direct video links (YouTube or TikTok):
   ```
   [video:URL|CAPTION]
   ```
   
   **Supported video platforms:**
   - YouTube: `https://www.youtube.com/watch?v=VIDEO_ID` or `https://youtu.be/VIDEO_ID`
   - TikTok: `https://www.tiktok.com/@username/video/VIDEO_ID`

3. **Examples in context:**

```
Darjeeling tea, often called the "Champagne of Teas," is one of the world's most distinctive varieties.

[media-image-1|full|Darjeeling Tea in the Himalayas]

The cultivation happened simultaneously with the transplantation of Chinese tea.

[media-image-2|right|Workers and elephants during the 19th century.]

In 1788, Joseph Banks suggested to the East India Company that the climate of Northeast India was ideal for growing tea. A Scottish major named Robert Bruce discovered Assam tea in 1823.

The text will wrap around the floated image on the left side, creating a newspaper-style layout.
```

## Responsive Behavior

- On mobile devices (< 750px), all floated images automatically become full-width
- Captions remain centered below images
- Text wrapping is disabled on mobile for better readability

## Styling Notes

- Images have a subtle border (2px solid rgba(0,0,0,0.15))
- Box shadow for depth
- Captions use Georgia serif font
- Float images are 45% width on desktop, full-width on mobile

