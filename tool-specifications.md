# Tool Specifications & Integration Reference v2

A detailed breakdown of each tool to be integrated into a unified app. Descriptions cover purpose, inputs, outputs, core logic, edge cases, performance considerations, and identified overlaps to prevent duplication.

---

## How to Read This Document

Each tool entry follows a consistent structure:

- **ID** — Stable short key for use in code, routing, and cross-references (e.g., `social-cropper`)
- **Purpose** — What it does and who it's for
- **How it works** — Step-by-step user flow
- **Inputs / Outputs** — Data in and out
- **Core logic** — The algorithms and techniques under the hood
- **Edge cases & constraints** — What can go wrong, what the limits are
- **Performance notes** — Anything that could be slow or memory-heavy
- **Overlap notes** — Where this tool shares logic, components, or UI patterns with others
- **Complexity** — Estimated build complexity: Low / Medium / High

The final sections cover **Cross-Tool Workflows**, **Shared Components**, and **App-Level Concerns**.

---

## 1. Social Media

### 1A. Social Media Cropper
**ID:** `social-cropper`
**Complexity:** Medium

**Purpose:** Crops any uploaded image to the exact aspect ratio and pixel dimensions required by specific social media platforms. For designers, social media managers, and anyone posting visual content who doesn't want to fight each platform's cropping behavior.

**How it works:** The user uploads or drops an image. They select a target platform and format from a preset list (e.g., Instagram Square 1080×1080, Instagram Story 1080×1920, Bluesky header 3:1, Threads post 4:5, X/Twitter card 2:1, LinkedIn banner 1584×396, Facebook cover 820×312, YouTube thumbnail 1280×720). A crop region with the locked aspect ratio is overlaid on the image. The user can pan the image within the crop window and zoom in/out to frame their subject. On export, the image is rendered at the platform's recommended pixel dimensions and downloaded as PNG or JPEG (user's choice).

**Inputs:** Raster image (PNG, JPEG, WebP, GIF, BMP), platform/format selection from presets, zoom level, pan position, output format preference (PNG or JPEG).

**Outputs:** Cropped and resized image file at the exact target dimensions.

**Core logic:** Canvas-based crop and resize. Aspect ratio lock on the crop region. Platform preset database (a data structure mapping platform names to aspect ratios and pixel dimensions — must be easy to update as platforms change their specs). Pan/zoom is implemented as translate and scale transforms on the source image within a fixed viewport.

**Edge cases & constraints:**
- Source image smaller than target dimensions → upscaling will reduce quality. Show a warning when the source resolution is lower than the target. Optionally allow the user to proceed anyway.
- Animated GIFs → only the first frame should be used (or this should be noted to the user).
- Very large images (>10,000px) → may cause memory issues on mobile browsers. Cap input dimensions or downsample for preview while exporting from the original.
- Platform presets will go stale → the preset list should live in a single config file, easy to update without touching tool logic.

**Performance notes:** Canvas operations are fast for single images. No concerns unless input dimensions are extreme.

**Overlap notes:** Shares image upload/drop handling with nearly every Image tool. The crop/resize canvas logic overlaps with **Matte Generator** (`matte-gen`) and **Image Converter** (`img-converter`). A shared `ImageLoader` utility and `CanvasRenderer` module should serve all three. The platform preset database is unique to this tool.

---

### 1B. Matte Generator
**ID:** `matte-gen`
**Complexity:** Medium

**Purpose:** Places an image onto a larger canvas with a styled background (solid color, blur, gradient), so it can be posted on social platforms without being cropped. Commonly used for Instagram grid posts, but applicable to any situation where you want padding around an image.

**How it works:** The user uploads an image. The tool detects its aspect ratio and places it centered on a canvas. The user selects the output aspect ratio — square (1:1) by default, but also 4:5, 16:9, or custom. They choose a matte style: solid color (via color picker), blurred version of the image itself (the image is scaled up and blurred to fill the background), gradient (two-color linear or radial), or auto-matched (samples the dominant edge colors and creates a smooth fill). Padding is adjustable as a percentage (0–50%). The user can also adjust the inner image's scale and position. The result is exported at a configurable resolution.

**Inputs:** Raster image, output aspect ratio (1:1, 4:5, 16:9, or custom W:H), matte style (solid / blur / gradient / auto), padding percentage, optional custom color(s), output resolution, output format.

**Outputs:** Image on the styled matte at the selected aspect ratio and resolution.

**Core logic:** Canvas compositing. For blur backgrounds: draw the source image scaled to fill the canvas, apply CSS `filter: blur()` or a StackBlur-style algorithm, then draw the original image centered on top. For solid color: fill canvas, draw image. For gradient: create gradient fill, draw image. For auto-matched: sample edge pixels, compute average colors per edge, create a four-corner gradient.

**Edge cases & constraints:**
- Transparent PNGs → the matte background should show through transparent areas of the source image. The user might want this or might not — consider an option to flatten transparency first.
- Very wide or very tall images with 1:1 output → the image becomes very small within the square. Show a warning if the image would occupy less than 30% of the canvas area.
- Blur radius needs to be large enough to be obviously intentional, not just slightly soft.

**Performance notes:** Blur on large canvases can be slow. Use a downsampled version for the blur background (e.g., resize to 200px, blur, then scale up — the low resolution is invisible because it's blurred).

**Overlap notes:** Color picker is the shared widget from the Colour tools. Canvas compositing is shared with **Watermarker** (`watermarker`). Image upload handling is shared with all image tools. The "auto-matched" edge-color sampling is unique but simple. Output aspect ratio selection is conceptually similar to **Social Media Cropper** (`social-cropper`) platform presets, but here it's freeform rather than platform-locked.

---

### 1C. Seamless Scroll Generator
**ID:** `scroll-gen`
**Complexity:** Medium

**Purpose:** Splits a single tall or wide image into a series of carousel slides that, when swiped through on Instagram (or similar platforms), create a seamless scrolling panorama effect.

**How it works:** The user uploads a tall or wide image. They select the number of slides (2–10) and the output aspect ratio per slide (4:5 is standard for Instagram, but 1:1 and 16:9 are also offered). The tool calculates each slide's crop region such that adjacent slides share a small overlap zone — when swiped on Instagram, the overlap makes the transition appear seamless. The overlap amount is configurable (default ~5–10% of slide width). A preview animation simulates the swipe behavior so the user can verify alignment before exporting. Each slide is exported as a separate numbered image file, or all together as a ZIP.

**Inputs:** Raster image, number of slides (2–10), aspect ratio per slide, overlap percentage (0–20%), output format.

**Outputs:** Multiple image files (one per slide, numbered sequentially), or a ZIP archive.

**Core logic:** Calculate the total usable width (or height, depending on scroll direction) of the source image. Divide into N regions with overlap. For each region: crop from source, resize to target aspect ratio dimensions, export. ZIP generation uses JSZip or a similar library.

**Edge cases & constraints:**
- Source image not wide/tall enough for the requested number of slides → the tool should calculate minimum source dimensions and warn the user if their image is too small.
- Vertical vs. horizontal scroll → the tool should support both orientations, auto-detected from the source image's aspect ratio (landscape → horizontal scroll, portrait → vertical scroll).
- Overlap at 0% → effectively becomes a plain Image Splitter. This is fine but should be noted in the UI.

**Performance notes:** No significant concerns. Canvas operations are per-slide and sequential.

**Overlap notes:** Slicing logic is conceptually similar to **Image Splitter** (`img-splitter`). Scroll Generator slices with intentional overlap; Image Splitter does clean grid cuts with no overlap. They should share a base `canvasSlice(sourceCanvas, x, y, w, h)` utility and diverge only in how regions are calculated. ZIP download utility is shared. Batch file naming convention should be consistent across both tools.

---

### 1D. Watermarker
**ID:** `watermarker`
**Complexity:** Medium

**Purpose:** Overlays text or an image (like a logo) as a watermark on one or more images, for protecting work before sharing publicly or for branding.

**How it works:** The user uploads one or more images. They choose between a text watermark or an image watermark. For text: they type content, select font (from a curated list of web-safe and Google Fonts), size, color, opacity (0–100%), and rotation angle. For image: they upload a second image (typically a logo PNG with transparency), and adjust its scale and opacity. They select placement mode: a specific position (any of 9 anchor points: top-left, top-center, top-right, center-left, center, center-right, bottom-left, bottom-center, bottom-right), or tiled (repeating across the entire image with configurable spacing and rotation). The watermark is composited onto each uploaded image and the results are exported individually or as a ZIP.

**Inputs:** One or more raster images, watermark type (text or image), watermark content, font/size/color (for text), scale/opacity (for image), placement mode (position or tiled), rotation angle, tile spacing (if tiled), output format.

**Outputs:** Watermarked image(s), individually or as a ZIP.

**Core logic:** Canvas compositing with `globalAlpha` for opacity. For text: `ctx.fillText()` with font, rotation via `ctx.rotate()`, and anchor-point positioning math. For image watermarks: `ctx.drawImage()` with scaling. Tiling uses a loop with offset calculations. Batch processing iterates over all uploaded images.

**Edge cases & constraints:**
- Watermark text longer than the image width → wrap or truncate with ellipsis, or scale font down to fit. The user should see a preview before committing.
- Logo watermark with no transparency → won't look like a watermark. Show a note recommending a PNG with a transparent background.
- Very large batch (50+ images) → process in chunks to avoid UI freezing. Show a progress indicator.

**Performance notes:** Batch processing many large images can be memory-intensive. Process images sequentially (not all in memory at once) and release canvas references between iterations. Consider using `OffscreenCanvas` in a Web Worker for non-blocking batch processing.

**Overlap notes:** Font selection UI could be shared with **Glyph Browser** (`glyph-browser`) if the Glyph Browser allows previewing characters in different fonts. Opacity/alpha blending is shared conceptually with **Matte Generator** (`matte-gen`). Batch processing and ZIP download are shared with **Seamless Scroll Generator** (`scroll-gen`), **Image Splitter** (`img-splitter`), and **Image Converter** (`img-converter`). A shared `BatchProcessor` utility (process queue, progress callback, cancellation) would prevent reimplementing this in multiple tools.

---

## 2. Colour

### 2A. Color Harmony Generator
**ID:** `harmony-gen`
**Complexity:** Medium

**Purpose:** Given a base color, generates mathematically related color harmonies based on color wheel relationships. Helps designers build cohesive, intentional palettes rather than guessing at what colors "go together."

**How it works:** The user inputs a color via hex code, RGB values, HSL sliders, or a visual color picker. The tool calculates and displays sets of harmonious colors using standard color theory relationships:

- **Complementary** — the color directly opposite on the wheel (hue + 180°). High contrast pairs.
- **Analogous** — the two or three colors adjacent on the wheel (hue ± 30°). Harmonious, low-contrast.
- **Triadic** — three colors equally spaced (hue + 120° and + 240°). Vibrant, balanced.
- **Split-complementary** — the complement's two neighbors (hue + 150° and + 210°). Softer than complementary.
- **Tetradic / Square** — four colors equally spaced (hue + 90°, + 180°, + 270°). Rich, needs careful balance.
- **Monochromatic** — same hue, varied saturation and lightness. Safe, cohesive.

Each harmony is displayed as a row of color swatches with labeled values. Users can click any swatch to copy its value in their preferred format (hex, RGB, HSL, OKLCH). The base color's converted values in all supported formats are also displayed.

**Inputs:** A single base color in any supported format (hex, RGB, HSL, OKLCH, Lab, LCH).

**Outputs:** Visual display of 6 harmony sets (2–5 colors each). Copyable color values in multiple formats. The base color shown in all formats (acts as a mini color converter).

**Core logic:** HSL-based hue rotation for harmony calculations. Color format conversion library supporting hex ↔ RGB ↔ HSL ↔ OKLCH ↔ Lab ↔ LCH. The monochromatic set varies S and L while keeping H constant. All other harmonies rotate H while preserving S and L from the base.

**Edge cases & constraints:**
- Colors near the saturation extremes (pure white, pure black, fully desaturated grays) → hue rotation produces no visible difference. Detect and show a note: "Neutral colors don't produce meaningful hue-based harmonies. Try adjusting saturation."
- OKLCH and Lab conversions can produce colors outside the sRGB gamut → clamp to nearest in-gamut color and indicate when clamping has occurred (e.g., a small warning icon on the swatch).

**Performance notes:** Trivial. All calculations are instant math operations.

**Overlap notes:** **Heavy shared infrastructure** with **Contrast Checker** (`contrast-checker`) and **Color Blindness Simulator** (`cvd-sim`). All three need: a color input mechanism (picker + fields), color format conversion, and color swatch display with copy. These should be a single shared `ColorInput` component and `colorConvert` utility module. The harmony calculations themselves are unique to this tool. The "base color in all formats" display effectively embeds a mini Color Converter — if a full Color Converter tool is ever added, this logic is already available.

---

### 2B. Contrast Checker
**ID:** `contrast-checker`
**Complexity:** Medium

**Purpose:** Tests a foreground color against a background color and reports whether the combination meets WCAG 2.1 (and optionally WCAG 3.0 / APCA) accessibility standards for text readability. Essential for any designer or developer building interfaces that must be accessible.

**How it works:** The user inputs two colors (foreground and background) using hex fields, color pickers, or RGB/HSL sliders. The tool calculates the contrast ratio using the WCAG 2.1 relative luminance formula and reports:

- The numeric contrast ratio (e.g., 4.52:1)
- Pass/fail for **WCAG AA Normal Text** (≥ 4.5:1)
- Pass/fail for **WCAG AA Large Text** (≥ 3.0:1)
- Pass/fail for **WCAG AAA Normal Text** (≥ 7.0:1)
- Pass/fail for **WCAG AAA Large Text** (≥ 4.5:1)

A live preview renders sample text in the chosen foreground color on the chosen background at multiple sizes (14px, 18px, 24px, 32px) so the user can see the actual result. A swap button reverses foreground and background. An optional "suggest closest passing color" feature nudges the foreground color lighter or darker until it meets a selected threshold.

**Inputs:** Two colors (foreground and background) in any supported format.

**Outputs:** Contrast ratio number, pass/fail badges per WCAG level, live text preview at multiple sizes, optional suggested adjustment.

**Core logic:** sRGB linearization (inverse gamma): for each channel, if C ≤ 0.04045, Clinear = C/12.92, else Clinear = ((C+0.055)/1.055)^2.4. Relative luminance: L = 0.2126×R + 0.7152×G + 0.0722×B. Contrast ratio = (lighter + 0.05) / (darker + 0.05). "Suggest closest passing" walks the lightness axis in small increments until the ratio crosses the target threshold.

**Edge cases & constraints:**
- Both colors identical → ratio is 1:1, all checks fail. This is valid behavior, just show the result.
- Transparent foreground on a background → transparency complicates contrast calculation. For now, only accept opaque colors. If a color with alpha is entered, flatten it against the background first and note this to the user.
- The "suggest closest passing" feature can produce ugly colors → it should be presented as a starting point, not a recommendation.

**Performance notes:** Trivial. Instant math.

**Overlap notes:** Shares the `ColorInput` component and `colorConvert` module with **Harmony Generator** (`harmony-gen`) and **Color Blindness Simulator** (`cvd-sim`). The relative luminance function should be exposed in the shared color utility so the CVD Simulator can optionally show how contrast changes under simulated vision. The live text preview is unique to this tool.

---

### 2C. Color Blindness Simulator
**ID:** `cvd-sim`
**Complexity:** High

**Purpose:** Shows how colors or images appear to people with various types of color vision deficiency (CVD). Enables designers to verify their palettes, UI designs, and images are distinguishable for all users — not just those with typical vision.

**How it works:** The tool has two input modes:

**Color mode:** The user inputs one or more colors (up to ~10). For each CVD type, the tool shows a row of transformed swatches alongside the originals, making it immediately visible which colors become indistinguishable.

**Image mode:** The user uploads an image. The tool renders the image through each CVD simulation filter. Results are displayed as a grid of side-by-side comparisons (original + each type), or the user can toggle between types using tabs or a dropdown. A split-view slider (left = original, right = simulated) is available for direct comparison.

Supported CVD types:
- **Protanopia** — no red cones (~1.3% of males)
- **Deuteranopia** — no green cones (~1.2% of males)
- **Tritanopia** — no blue cones (~0.001% of population)
- **Protanomaly** — weak red cones (~1.3% of males)
- **Deuteranomaly** — weak green cones (~5% of males, most common CVD)
- **Tritanomaly** — weak blue cones (very rare)
- **Achromatopsia** — total color blindness (extremely rare)
- **Achromatomaly** — weak total color vision (very rare)

**Inputs:** One or more colors (hex/RGB/HSL), or a raster image. Selection of which CVD types to simulate (all by default).

**Outputs:** Simulated color swatches per CVD type, or simulated images. Side-by-side or split-view comparison.

**Core logic:** CVD simulation using Machado et al. (2009) color transformation matrices, which are the current scientific standard. The process: convert sRGB to linear RGB, apply the 3×3 CVD matrix for the selected type and severity, convert back to sRGB, clamp. For anomalous trichromacy types (protanomaly, etc.), the severity parameter (0.0–1.0) controls the blend between normal and dichromatic vision. For images, this transformation is applied per-pixel on canvas `ImageData`.

**Edge cases & constraints:**
- Large images (>4000px) in image mode → per-pixel processing on 16+ million pixels × 8 CVD types is expensive. See performance notes.
- Grayscale images → all CVD simulations produce the same output (no hue information to shift). Detect and note this.
- The simulation is an approximation — individual CVD experiences vary. Include a disclaimer.

**Performance notes:** **This is the most performance-sensitive tool in the set.** Per-pixel canvas operations on large images are slow on the main thread. Mitigations: (1) process on a downsampled preview (e.g., 800px wide) for real-time interaction, apply to full resolution only on export; (2) use Web Workers for off-thread processing; (3) generate CVD types on demand (only when the user selects a tab) rather than all 8 simultaneously.

**Overlap notes:** Shares `ColorInput` and `colorConvert` with **Harmony Generator** (`harmony-gen`) and **Contrast Checker** (`contrast-checker`). Image upload is shared with all Image tools. The CVD matrices and per-pixel processing pipeline are entirely unique to this tool. **Cross-tool opportunity:** allow piping the Harmony Generator's output colors directly into the CVD Simulator to check if a harmony set remains distinguishable under CVD. This should be a "Check accessibility" action on the Harmony Generator, not duplicated logic.

---

## 3. Images & Assets

### 3A. Favicon Generator
**ID:** `favicon-gen`
**Complexity:** Medium

**Purpose:** Takes any uploaded image and generates a complete set of favicon files in all sizes and formats needed for modern web development. Saves developers from manually resizing and formatting an icon for every platform.

**How it works:** The user uploads an image. If the image is not square, the tool offers a crop-to-square step (using the shared crop UI from Social Media Cropper). The tool then generates the full favicon package:

- `favicon.ico` (multi-resolution: 16×16, 32×32, 48×48)
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png` (180×180)
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`
- `mstile-150x150.png` (Windows tiles)
- `safari-pinned-tab.svg` (optional, if the source is simple enough to auto-trace)
- `site.webmanifest` (JSON file referencing the Android icons)
- HTML snippet: the `<link>` tags to paste into `<head>`

Everything is previewed and downloadable as a ZIP.

**Inputs:** A single image (any raster format), optional crop area, optional background color (for transparent images rendered on solid backgrounds, like iOS).

**Outputs:** ZIP containing all favicon files + webmanifest + HTML snippet. The HTML snippet is also shown in a copyable code block.

**Core logic:** Canvas-based resize to each target dimension using high-quality downsampling (bicubic or Lanczos if available, otherwise `imageSmoothingQuality: 'high'`). ICO format generation: this is a binary container format wrapping multiple BMP or PNG images — requires either a library (like `png-to-ico`) or manual binary packing. Webmanifest is a JSON template with icon paths filled in.

**Edge cases & constraints:**
- Source image is a photograph rather than an icon/logo → favicons will look muddy at 16×16. No way to prevent this, but a warning could say "For best results, use a simple icon or logo with clear shapes."
- Transparent PNG on iOS → iOS doesn't support transparent icons; it fills with black. The tool should let the user set a background color specifically for the Apple Touch icon.
- ICO format generation in-browser is non-trivial. May need a small library or manual implementation of the ICO binary spec.

**Performance notes:** Generating ~8 PNG resizes is fast. ICO binary packing is the only slightly complex step but still instant.

**Overlap notes:** Resize logic is shared with **Image Converter** (`img-converter`) — both resize images to target dimensions. The crop-to-square step reuses the crop UI from **Social Media Cropper** (`social-cropper`). The HTML snippet output overlaps with **Meta Tag Generator** (`meta-tag-gen`) — Favicon Generator produces favicon-specific `<link>` tags, Meta Tag Generator produces the broader set. When both tools exist in the same app, Meta Tag Generator should have a "Favicon" section that either references the Favicon Generator's output or embeds it. ZIP download is shared.

---

### 3B. SVG Optimiser
**ID:** `svg-optimiser`
**Complexity:** Medium–High

**Purpose:** Takes an SVG file and strips unnecessary metadata, comments, hidden elements, default values, and redundant attributes to reduce file size without changing the visual output. Critical for performance-conscious web development where SVGs are used for icons, illustrations, and UI elements.

**How it works:** The user uploads an SVG file or pastes SVG code into a text area. The tool parses the SVG XML and applies a series of optimization passes (each individually toggleable):

- Remove editor metadata (Inkscape, Illustrator, Sketch namespaces and attributes)
- Strip XML comments
- Remove empty `<g>` groups and `<defs>` blocks
- Remove hidden elements (`display: none`, zero-opacity)
- Collapse unnecessary group nesting (groups with no attributes wrapping a single child)
- Remove default/inherited attribute values (e.g., `fill="black"` when black is the default)
- Optimize `<path>` data (convert absolute to relative commands where shorter, remove trailing zeros, merge consecutive commands)
- Minify color values (`#FF0000` → `#F00`, `rgb(255,0,0)` → `#F00`)
- Remove `width`/`height` in favor of `viewBox` only (optional)
- Round numeric precision (e.g., from 8 decimal places to 2)
- Remove unused `<defs>` (gradients, filters, clip-paths that aren't referenced)

A before/after file size is shown (bytes and percentage reduction). The visual output is rendered side-by-side for verification. The optimized SVG can be downloaded as a file or copied as code.

**Inputs:** SVG file or pasted SVG code string.

**Outputs:** Optimized SVG file or code. Size comparison (original bytes → optimized bytes, % reduction). Visual preview.

**Core logic:** DOM-based SVG/XML parsing (`DOMParser`). Tree traversal for each optimization pass. Path data parsing and rewriting (this is the most complex part — a mini path command parser). Serialization back to string via `XMLSerializer`.

**Edge cases & constraints:**
- SVG with embedded raster images (`<image>` with base64 data) → these can't be optimized by path simplification. Note the embedded image size separately.
- SVG using CSS `<style>` blocks → attribute-level optimization must not conflict with CSS selectors. If the SVG uses classes, don't remove class attributes.
- Heavily complex SVGs (thousands of paths, like map data) → optimization may take a few seconds.
- Some optimizations can change rendering (e.g., removing a group that had `opacity` applied). Each pass should be individually toggleable so users can back off aggressive optimizations.

**Performance notes:** Parsing and serializing large SVGs (1MB+) can take a noticeable moment. Path optimization on thousands of path elements should be done incrementally with a progress indicator.

**Overlap notes:** This is the only tool that works with SVG source code/markup. **Image Tracer** (`img-tracer`) outputs SVG, so the Optimiser could be chained after tracing (see Cross-Tool Workflows). No shared logic with other tools. The code display/copy UI pattern is shared with **Encoding Tools** (`encoder`), **Meta Tag Generator** (`meta-tag-gen`), and **Regex Tester** (`regex-tester`).

---

### 3C. Placeholder Generator
**ID:** `placeholder-gen`
**Complexity:** Low

**Purpose:** Generates simple placeholder images at specified dimensions, useful during development when real content images aren't available yet. The developer equivalent of "lorem ipsum" for images.

**How it works:** The user enters desired width and height in pixels. Optional customizations: background color (default: a neutral gray like `#CCCCCC`), text color (default: `#666666`), display text (defaults to the dimensions, e.g., "800 × 600"), font family, and output format (PNG, JPEG, WebP, SVG). The tool renders the placeholder on a canvas (or as an SVG element for SVG output) and provides it for download. It also generates a data URL and a base64 string that can be used directly in `<img>` tags or CSS.

**Inputs:** Width (px), height (px), background color, text color, display text, font, output format.

**Outputs:** Placeholder image file download. Data URL string (copyable). Base64 string (copyable).

**Core logic:** Canvas fill + centered text rendering. For SVG output: generate an `<svg>` element with a `<rect>` and `<text>`. Data URL generation via `canvas.toDataURL()`.

**Edge cases & constraints:**
- Very small dimensions (e.g., 10×10) → text won't fit. Auto-hide text below a minimum size threshold (e.g., < 40px in either dimension).
- Very large dimensions (e.g., 10000×10000) → large memory allocation for the canvas. Cap at a reasonable maximum (e.g., 5000×5000) or warn the user.

**Performance notes:** Trivial for any reasonable dimensions.

**Overlap notes:** Color picker is the shared widget. Canvas text rendering approach is similar to **Watermarker** (`watermarker`) but much simpler. The data URL / base64 output is conceptually related to **Encoding Tools** (`encoder`) but serves a different purpose. Otherwise fully self-contained.

---

### 3D. Image Splitter
**ID:** `img-splitter`
**Complexity:** Low–Medium

**Purpose:** Splits a single image into a grid of equal tiles. Used for creating Instagram grid mosaics, cutting sprite sheets into individual sprites, slicing large images for lazy-loading, or preparing tiles for print.

**How it works:** The user uploads an image and specifies grid dimensions: number of rows and number of columns (e.g., 3×3, 2×4, 5×1). The tool overlays a visible grid on the image preview showing exactly where cuts will be made. The user can see the tile dimensions that result from the split. On export, each tile is rendered as a separate image file, numbered in reading order (left-to-right, top-to-bottom: `tile-01.png`, `tile-02.png`, etc.). All tiles are downloadable individually or as a ZIP.

**Inputs:** Raster image, number of rows (1–20), number of columns (1–20).

**Outputs:** Multiple image files (one per tile), or a ZIP archive. Files are named with sequential numbers.

**Core logic:** Calculate tile width = `sourceWidth / columns`, tile height = `sourceHeight / rows`. For each tile: `ctx.drawImage(source, col*tileW, row*tileH, tileW, tileH, 0, 0, tileW, tileH)`, export canvas. Clean grid divisions — no overlap.

**Edge cases & constraints:**
- Source dimensions not evenly divisible by the grid → some tiles will be 1px larger/smaller than others. Use `Math.floor` for interior tiles and let the last row/column absorb the remainder.
- 1×1 grid → just exports the original image. Technically valid but pointless. Could show a subtle hint.
- Very fine grids (e.g., 20×20 = 400 tiles) → ZIP generation takes a moment. Show progress.

**Performance notes:** Fine for typical grids. Large tile counts (100+) should generate sequentially, not all at once.

**Overlap notes:** Shares slicing concept with **Seamless Scroll Generator** (`scroll-gen`), differing only in overlap handling. Shared `canvasSlice()` utility. ZIP download and batch file naming are shared with Scroll Generator, Watermarker, and Image Converter.

---

### 3E. Image Converter
**ID:** `img-converter`
**Complexity:** Medium

**Purpose:** Converts images between raster formats with optional resizing and quality adjustment. Batch processing supported. Covers the common "I have a PNG and need a JPEG" use case, plus more exotic formats.

**How it works:** The user uploads one or more images in any supported input format. They select a target output format: PNG, JPEG, WebP, AVIF, or ICO. For lossy formats (JPEG, WebP, AVIF), a quality slider (1–100) controls compression. Optional resize: enter target dimensions in pixels or as a percentage of original. Option to strip or preserve EXIF metadata (for JPEG). Each converted image is previewed with before/after file sizes shown. All results are downloadable individually or as a ZIP.

**Inputs:** One or more raster images, target format, optional quality (1–100), optional resize (px or %), metadata handling preference.

**Outputs:** Converted image(s) in the target format. File size comparison. Individual or ZIP download.

**Core logic:** Canvas-based conversion: draw source image onto canvas, export via `canvas.toBlob(callback, mimeType, quality)`. Supported natively by browsers: PNG, JPEG, WebP. AVIF support varies by browser (Chrome/Edge yes, Firefox/Safari partial) — detect support and show format availability. For ICO: use the same ICO binary packing as Favicon Generator.

**Edge cases & constraints:**
- **BMP and TIFF are not natively exportable from browser canvas.** These require JS libraries for binary encoding and are excluded from output formats. They are accepted as *input* (browsers can decode them). This is noted in the UI.
- **ICNS (macOS icon format)** is excluded — too specialized and requires a non-trivial binary format.
- **GIF output** — canvas cannot produce animated GIFs. Static GIF export is possible but of limited usefulness. Accepted as input only.
- AVIF encoding can be slow in-browser → show a progress indicator and note processing time.
- Converting a JPEG to PNG increases file size (lossy → lossless) — show the size increase and note this is expected behavior.
- Batch of many large images → process sequentially with progress bar and cancellation.

**Performance notes:** AVIF encoding is significantly slower than other formats. WebP is moderately slower than JPEG/PNG. For batch processing, use the shared `BatchProcessor` with progress and cancellation support.

**Overlap notes:** **Significant overlap** with **Favicon Generator** (`favicon-gen`): both resize and export to multiple formats including ICO. The resize logic and ICO packing should be shared modules. Resize also overlaps with **Social Media Cropper** (`social-cropper`). Batch processing is shared with **Watermarker** (`watermarker`). The `BatchProcessor` utility should be built once.

---

### 3F. Artwork Enhancer
**ID:** `artwork-enhancer`
**Complexity:** Medium

**Purpose:** Adds film grain, color noise, or texture overlays to digital artwork to give it a more organic, analog, or tactile appearance. Popular among illustrators and designers who want to soften the "too-clean digital" look.

**How it works:** The user uploads an image. They select from effect types (stackable — multiple can be applied at once):

- **Color noise** — random colored pixels scattered at low opacity. Controls: intensity (0–100%), grain size (1–5px), color range (full spectrum or limited to warm/cool tones).
- **Film grain** — monochromatic noise mimicking photographic film grain. Controls: intensity, grain size, grain type (fine/medium/coarse).
- **Halftone** — dot pattern overlay simulating print halftone screens. Controls: dot spacing, dot size range, angle.
- **Texture overlay** — a predefined or uploaded texture image blended onto the artwork. Controls: texture selection, scale, opacity, blend mode.

All effects include a blend mode selector (overlay, multiply, screen, soft light, hard light) and opacity control. A live split-view preview shows original vs. enhanced. Effects are applied non-destructively in the preview (each as a separate canvas layer). On export, all layers are flattened and the result is downloaded as PNG or JPEG.

**Inputs:** Raster image, one or more effect types with their respective parameters, blend mode per effect, overall opacity per effect.

**Outputs:** Enhanced image (PNG or JPEG).

**Core logic:** For noise effects: generate random pixel data in an `ImageData` buffer, composite onto the source using the selected blend mode. Blend modes are implemented as per-pixel math (e.g., overlay: `result = base < 0.5 ? 2*base*blend : 1 - 2*(1-base)*(1-blend)`). For halftone: sample luminance at grid points, draw dots scaled by luminance. For texture overlay: draw a texture image tiled/scaled to cover the canvas, apply blend mode.

**Edge cases & constraints:**
- Effects at 100% intensity can completely obscure the source image. The preview should make this obvious, but a warning at very high values wouldn't hurt.
- Halftone at very tight spacing produces moiré patterns when viewed on screen → note that halftone is best for print output.
- Stacking many effects → each adds processing time. Cap at 5 simultaneous effects.

**Performance notes:** Pixel-level operations on large images are moderately expensive. Generate noise at a downsampled resolution for preview, apply at full resolution only on export. Blend mode math on 10+ megapixel images should use `ImageData` manipulation (getImageData/putImageData), not individual pixel reads.

**Overlap notes:** Canvas pixel manipulation is the same general technique as **Color Blindness Simulator** (`cvd-sim`), but the actual operations are completely different (noise generation vs. color matrix transformation). Blend mode math could be a shared utility if any other tool needs it (currently none do). Image upload and export pipeline is shared.

---

### 3G. Image Tracer
**ID:** `img-tracer`
**Complexity:** High

**Purpose:** Converts a raster image (PNG, JPEG, etc.) into an SVG vector by tracing edges and color regions. Produces scalable vector output from bitmap input — useful for converting logos, icons, or illustrations to a resolution-independent format.

**How it works:** The user uploads a raster image. The tool processes it through several stages:

1. **Color quantization** — reduce the image to a manageable number of distinct colors (user-configurable: 2–64 colors). Uses median cut or k-means clustering.
2. **Layer separation** — for each quantized color, create a binary mask of pixels matching that color.
3. **Edge detection** — for each color layer, trace the boundary between filled and empty pixels.
4. **Path tracing** — convert the pixel boundaries into vector paths (sequences of line segments).
5. **Curve fitting** — simplify the paths by fitting Bézier curves through the traced points, controlled by a smoothness/detail parameter.
6. **SVG generation** — assemble the traced paths into an SVG document with `<path>` elements and fill colors.

Controls: number of colors (2–64), detail level (path simplification threshold — lower = more detail, higher = smoother curves), minimum area (ignore regions smaller than N pixels), corner detection threshold (angle at which a smooth curve becomes a sharp corner), mode (multi-color trace or single-color silhouette). Output SVG is previewed alongside the original. Can be downloaded as `.svg` or code can be copied.

**Inputs:** Raster image, number of colors, detail/smoothness level, minimum area, corner threshold, trace mode.

**Outputs:** SVG file or code. Side-by-side preview with original.

**Core logic:** Color quantization (median cut). Marching squares or Potrace-style boundary tracing. Bézier curve fitting (least-squares fitting to point sequences). SVG `<path>` `d` attribute generation.

**Edge cases & constraints:**
- Photographs produce extremely complex SVGs with thousands of paths that are often larger than the original raster image and don't look good. Show a warning for images with many colors or gradients: "Tracing works best on illustrations, logos, and flat-color artwork."
- Very small images (< 100px) → tracing produces blocky, low-quality results.
- Single-color silhouette mode with a complex image → user needs to threshold the image first. Consider adding a brightness threshold slider for silhouette mode.

**Performance notes:** **Second most performance-intensive tool** after the CVD Simulator. Color quantization on large images is O(n) in pixel count. Path tracing is O(n) per color layer. For a 2000×2000 image with 16 colors, expect several seconds of processing. Use a Web Worker and show a progress indicator. Generate a low-res preview trace instantly, then refine at full resolution.

**Overlap notes:** Outputs SVG, which could be passed to **SVG Optimiser** (`svg-optimiser`) for further cleanup (see Cross-Tool Workflows). The code display/copy UI is shared with SVG Optimiser, Encoding Tools, and Meta Tag Generator. No shared core logic with any other tool.

---

## 4. Typography & Text

### 4A. PX to REM Converter
**ID:** `px-to-rem`
**Complexity:** Low

**Purpose:** Converts pixel values to rem units (and vice versa) based on a configurable root font size. The most common CSS unit conversion, needed by every front-end developer working with responsive design.

**How it works:** The user enters a pixel value. Based on a root font size (default 16px, adjustable), the tool instantly shows the equivalent rem value. Works bidirectionally — entering a rem value shows pixels. A reference table displays common conversions (10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 64px) at the current base size. The user can change the base font size to match their project.

**Inputs:** A numeric value in px or rem, base font size in px (default 16).

**Outputs:** Converted value in the opposite unit. Quick-reference table.

**Core logic:** `rem = px / base`, `px = rem × base`. That's it.

**Edge cases & constraints:**
- Base font size of 0 → division by zero. Prevent this with a minimum value of 1.
- Negative values → technically valid in CSS for some properties. Allow them.

**Performance notes:** Trivial.

**Overlap notes:** **This is a strict subset of Typography Calculator** (`typo-calc`). The px ↔ rem conversion is one of the many conversions the Typography Calculator handles. Recommendation: keep PX to REM as a standalone quick-access tool for the most common use case. Share the conversion math via a `typographyConvert` module. Users who want px↔rem don't want to navigate 12 unit types to get there.

---

### 4B. Line Height Calculator
**ID:** `line-height-calc`
**Complexity:** Low

**Purpose:** Calculates optimal line-height values for text readability based on font size, line length, and typographic best practices. Helps designers and developers choose leading that makes body text comfortable to read.

**How it works:** The user inputs a font size (in px, pt, or rem) and optionally a line length (in characters per line, or container width in px). They select a content type: body text, headings, captions, or UI labels. The tool applies typographic guidelines to suggest an ideal line-height:

- Body text: 1.4–1.8× (higher for longer lines)
- Headings: 1.1–1.3×
- Captions/UI: 1.2–1.5×

The result is shown in multiple units: unitless ratio (e.g., 1.5), pixels, rem, em, and percentage. A live preview renders sample text at the specified font size and line height so the user can visually evaluate readability. The user can manually override the calculated value and see the preview update.

**Inputs:** Font size (with unit), line length (optional, in characters or px), content type.

**Outputs:** Recommended line-height in 5 unit formats. Live text preview. Manual override with live update.

**Core logic:** Base ratio from a lookup table by content type. Adjustment factor based on line length: `adjustedRatio = baseRatio + (lineLength - 45) * 0.005` (longer lines need more leading). Clamped to reasonable bounds per content type. Unit conversion via the shared typography math module.

**Edge cases & constraints:**
- Very small font sizes (< 8px) or very large (> 120px) → guidelines don't apply cleanly. Show the calculated value but note it's outside typical range.
- Line length not provided → use the midpoint ratio for the selected content type.

**Performance notes:** Trivial.

**Overlap notes:** Uses the shared `typographyConvert` module for unit conversion (same as PX to REM and Typography Calculator). The live text preview is a unique UI element for this tool. Could be integrated as a tab or mode within the Typography Calculator, but has enough distinct behavior (content type selection, line-length-aware calculation, live preview) to justify standalone status.

---

### 4C. Typography Calculator
**ID:** `typo-calc`
**Complexity:** Low–Medium

**Purpose:** Converts between typographic measurement units used in both print and digital design, including traditional units that most modern tools ignore. The comprehensive reference tool for anyone working across print and screen.

**How it works:** The user enters a numeric value and selects its source unit from the full list: pixels, points (pt), picas, ems, rems, inches, millimeters, centimeters, agates (used in newspaper column-inch advertising), ciceros (European typographic unit), and didots (the base unit of the cicero). The tool instantly converts to all other units, displayed in a clean table. Context-sensitive settings: DPI (default 96 for screen, 300 for print — affects the pixel ↔ physical unit relationship) and base font size (default 16px — affects em and rem calculations).

**Inputs:** A numeric value, source unit, DPI setting, base font size.

**Outputs:** Conversion table showing the equivalent value in every supported unit.

**Core logic:** Chain conversion through a common base unit (points):
- 1 inch = 72 points
- 1 pica = 12 points
- 1 cicero = 12 didots
- 1 didot = 0.376065mm
- 1 point = 0.352778mm
- 1 agate = 5.142857 points (1/14 inch)
- 1 pixel = 72/DPI points (at 96 DPI: 1px = 0.75pt)
- 1 em = base font size in points
- 1 rem = root font size in points

**Edge cases & constraints:**
- DPI has a major impact on pixel conversions → make the DPI setting prominent and explain its effect.
- Em and rem depend on context (base size) → clearly label that these are relative units requiring a base size to be meaningful.
- Agate is an obscure unit — include a tooltip explaining its use in newspaper advertising.

**Performance notes:** Trivial.

**Overlap notes:** **Directly overlaps** with **PX to REM** (`px-to-rem`) — px↔rem is a subset. Shares math via `typographyConvert` module. Also overlaps conceptually with **Line Height Calculator** (`line-height-calc`) which converts line-height between units. The shared module should handle all unit math; each tool provides a different UI and purpose around that math.

---

### 4D. Glyph & Emoji Browser
**ID:** `glyph-browser`
**Complexity:** Medium–High

**Purpose:** Browse, search, and copy Unicode characters and emoji by category, name, or code point. A visual reference for finding symbols, special characters, arrows, mathematical notation, dingbats, currency signs, and emoji without memorizing codes or hunting through character maps.

**How it works:** The tool presents a searchable, browsable catalog organized into two main sections:

**Unicode Characters:**
Categories include Basic Latin, Latin Extended, Greek and Coptic, Cyrillic, Arrows, Mathematical Operators, Box Drawing, Block Elements, Geometric Shapes, Miscellaneous Symbols, Dingbats, Currency Symbols, Letterlike Symbols, Number Forms, Technical Symbols, Braille Patterns, CJK Symbols (limited set), and more. Each category is a collapsible section or a filterable view.

**Emoji:**
Organized by Unicode CLDR categories: Smileys & Emotion, People & Body, Animals & Nature, Food & Drink, Travel & Places, Activities, Objects, Symbols, Flags. Emoji include skin tone modifiers (Fitzpatrick scale: light to dark, shown as variants when a base emoji supports them), gender variants, and multi-person combinations where applicable. Emoji data source: Unicode CLDR emoji data (version 15.1 or latest), which provides short names, keywords, and category assignments.

**Interaction:** Clicking any character or emoji copies it to the clipboard (with a brief toast confirmation). A detail panel shows: the character rendered large, its Unicode name, code point (U+XXXX), HTML entity (if one exists, e.g., `&rarr;`), CSS `content` value (e.g., `\2192`), UTF-8 byte encoding, JavaScript escape (`\u2192`), and for emoji, the shortcode (e.g., `:thumbsup:`). Search works across character names, keywords, and code points. A "recently copied" section shows the user's last 10–20 copied characters for quick re-access (stored in component state, not persistent).

**Inputs:** Search query (text, keyword, or code point), category browsing, skin tone selection (for emoji).

**Outputs:** Character grid with copy-to-clipboard. Detail info panel. Recently copied list.

**Core logic:** A static Unicode character database loaded as JSON (names, code points, categories). Full-text search across character names with debounced input. Emoji data from a CLDR-derived dataset including keywords, skin tone base/modifier mappings, and category assignments. Virtualized rendering (only render characters visible in the viewport) for performance with large datasets. Clipboard API (`navigator.clipboard.writeText()`) for copy.

**Edge cases & constraints:**
- The full Unicode catalog is enormous (150,000+ code points). Only include commonly useful blocks — not the entire CJK Unified Ideographs set (20,000+ characters) or every historical script. Curate the set to maybe 5,000–8,000 of the most useful characters plus all emoji (~3,600).
- Emoji rendering depends on the user's OS and browser. Some emoji may render differently or not at all on older systems. There's no fix for this — it's inherent to emoji.
- Skin tone modifiers: the base emoji and each modified variant are separate code points. The UI should show the default (yellow) emoji with a skin tone selector that reveals variants, rather than listing all 6 versions separately.
- Search should be fast — use a pre-built index or simple substring matching on names (no need for fuzzy search at this scale).

**Performance notes:** Rendering thousands of characters at once will cause jank. **Virtualized scrolling is essential** — only render characters in the visible viewport plus a small buffer. Libraries like `react-window` or a custom `IntersectionObserver` approach work well. Initial data load of the character database JSON (~200–400KB gzipped) should be lazy-loaded after the tool is opened.

**Overlap notes:** No logic overlap with other tools. The clipboard copy interaction is shared across many tools. The search/filter UI pattern is a generic component. The character info panel's display of multiple encoding formats (HTML entity, CSS value, JS escape) is conceptually related to **Encoding Tools** (`encoder`) but presents character encoding info rather than arbitrary text encoding.

---

## 5. Print & Utility

> **Note on categorization:** This section combines print-specific tools with general developer utilities. The original delphi.tools site splits these across "Print & Production" and "Other Tools." In a unified app, these tools share the trait of being developer/production focused rather than visual/design focused. The tools within this section have minimal overlap with each other.

### 5A. PDF Preflight
**ID:** `pdf-preflight`
**Complexity:** High

**Purpose:** Analyzes a PDF file for common print-readiness issues before sending to a commercial printer. Catches problems that would cause rejected print jobs, wasted materials, or poor output quality. Targeted at graphic designers, print production staff, and self-publishing authors.

**How it works:** The user uploads a PDF. The tool parses the PDF's internal structure and checks against a set of print-production rules:

- **Image resolution** — flags raster images placed below 300 DPI (the standard minimum for commercial print). Calculates effective DPI as `pixelDimension / placedDimension`.
- **Color space** — identifies objects using RGB where CMYK is expected for print. Also flags spot colors and mixed color spaces.
- **Bleed/trim box** — checks if the PDF defines a TrimBox and BleedBox, and whether the BleedBox extends at least 3mm (0.125") beyond the TrimBox on all sides.
- **Font embedding** — verifies all fonts are embedded or subsetted. Flags any referenced (non-embedded) fonts.
- **Transparency** — identifies transparent objects, which can cause issues with older RIP systems. Notes transparency flattening status.
- **Overprint** — detects overprint settings that may cause unexpected results.
- **Page size consistency** — checks all pages are the same size (or flags inconsistencies).
- **Total ink coverage** — estimates whether any area exceeds typical TAC limits (e.g., 300% for web offset, 340% for sheetfed).

Results are presented as a structured report with pass/warning/fail indicators, organized by check type. Each issue includes a plain-language explanation of why it matters and which page(s) are affected.

**Inputs:** A PDF file.

**Outputs:** Preflight report with pass/warning/fail status per check, issue details, and page references.

**Core logic:** PDF parsing — this requires a library capable of reading PDF structure (objects, streams, resources, cross-reference tables). In-browser options: `pdf-lib` (for structure reading), `pdfjs-dist` (Mozilla's PDF.js, primarily a renderer but exposes some structural info), or a custom parser for the specific data needed. Image resolution calculation requires extracting image dimensions and their placement transforms. Font embedding detection requires reading the Font resource dictionaries. Color space identification reads ColorSpace objects in page resources.

**Edge cases & constraints:**
- Encrypted/password-protected PDFs → cannot be parsed. Show a clear error.
- Very large PDFs (100+ pages, 100MB+) → parsing may be slow or hit memory limits. Show a progress indicator and consider setting a file size limit (e.g., 50MB).
- PDFs generated by different tools have wildly different internal structures → the parser must handle both well-formed and loosely-formed PDFs.
- This tool analyzes but does not fix issues. It's read-only — the user must correct problems in their source application. Make this clear in the UI.

**Performance notes:** PDF parsing can be memory-intensive for large files. Process pages sequentially rather than loading the entire document into memory. Show results incrementally as each page is analyzed.

**Overlap notes:** This is the only PDF-specific tool and the only tool that reads binary file formats. No overlap with other tools except the file upload handler and the report-style UI pattern (checklist with pass/warning/fail indicators).

---

### 5B. QR Code Generator
**ID:** `qr-gen`
**Complexity:** Medium

**Purpose:** Generates QR codes from text, URLs, or structured data, with extensive visual customization. Goes beyond basic black-and-white squares to produce styled, branded QR codes.

**How it works:** The user enters content. Content type presets help format the data correctly:

- **URL** — plain URL string
- **Plain text** — any text
- **Email** — generates a `mailto:` link with optional subject/body
- **Phone** — generates a `tel:` link
- **WiFi** — generates `WIFI:S:<ssid>;T:<security>;P:<password>;;` format
- **vCard** — generates a vCard string from name, phone, email, org fields

Customization options: foreground color, background color, module (dot) shape (square, rounded square, circle, diamond, star), finder pattern (eye) style (square, rounded, circle, leaf), error correction level (L: 7%, M: 15%, Q: 25%, H: 30% — higher allows more obstruction), optional center logo (image upload, sized to not exceed ~30% of QR area). The QR code updates live as the user changes settings. Download as PNG (at configurable resolution: 256–4096px), SVG, or PDF.

**Inputs:** Content string (or structured fields for WiFi/vCard/Email), content type preset, foreground color, background color, module shape, finder pattern style, error correction level, optional logo image, output format, output resolution.

**Outputs:** QR code in the selected format.

**Core logic:** QR code encoding: data analysis (numeric, alphanumeric, byte, kanji mode selection), error correction codeword generation (Reed-Solomon), module placement (data, format info, version info, alignment patterns, timing patterns), masking (8 mask patterns evaluated, best selected by penalty score). Rendering: iterate over the module matrix and draw each module using the selected shape. A library like `qrcode-generator` or `qr-code-styling` handles the encoding; the shape rendering can be custom canvas drawing.

**Edge cases & constraints:**
- Content too long for a single QR code at the selected error correction level → the QR version (size) increases automatically, but there's an upper limit (version 40 = 177×177 modules). If exceeded, show an error suggesting the user shorten their content or lower the error correction level.
- Logo covering too much of the QR code → even with high error correction, a logo exceeding ~30% of the area can make the code unscannable. Enforce a size limit and warn the user.
- Very dark background with dark foreground → the QR code won't scan. Recommend minimum contrast (warn if contrast ratio between fg and bg is below 3:1 — reuse the contrast ratio function from Contrast Checker).

**Performance notes:** QR code generation is fast. SVG output for complex QR codes (version 40 with circular modules) can produce large SVG files — thousands of `<circle>` elements. Not a user-facing performance issue but worth noting.

**Overlap notes:** Color picker is the shared component. Contrast ratio check for fg/bg colors reuses the function from **Contrast Checker** (`contrast-checker`). Logo compositing uses the same canvas overlay approach as **Watermarker** (`watermarker`). SVG output is unrelated to **Image Tracer** or **SVG Optimiser** in logic.

---

### 5C. Meta Tag Generator
**ID:** `meta-tag-gen`
**Complexity:** Low–Medium

**Purpose:** Generates the complete set of HTML meta tags needed for SEO, social media sharing (Open Graph, Twitter/X Cards), and basic site metadata. Saves developers from memorizing tag names and property values, and provides visual previews of how the page will appear when shared.

**How it works:** The user fills in a form with fields grouped by purpose:

**Basic SEO:** page title (with character count, recommended ≤ 60), meta description (with character count, recommended ≤ 160), canonical URL, robots directives (index/noindex, follow/nofollow), author, keywords.

**Open Graph (Facebook, LinkedIn, etc.):** og:title, og:description, og:image (URL), og:url, og:type (website, article, product, etc.), og:site_name, og:locale.

**Twitter/X Card:** card type (summary, summary_large_image, app, player), twitter:site (@handle), twitter:creator (@handle). Title, description, and image fall through from OG tags unless overridden.

**Other:** theme-color (for mobile browser chrome), viewport (with sensible default), charset (default UTF-8).

As the user fills in fields, the tool live-generates the HTML code block and renders visual previews: a Google search result snippet (showing how the title and description would appear), a Facebook/LinkedIn share card, and a Twitter/X card. All generated code is copyable as a single block.

**Inputs:** Form fields for title, description, URL, image URL, social handles, and various tag options.

**Outputs:** Generated HTML meta tag block (copyable). Visual previews of Google, Facebook, and Twitter appearance.

**Core logic:** Template-based string generation. HTML attribute escaping. Character count validation with visual indicators (green → yellow → red as limits approach). Preview rendering: mock-ups of search results and social cards using the provided data, truncated per platform rules (Google: ~60 char title, ~160 char description; Facebook: 2–3 lines of description; Twitter: varies by card type).

**Edge cases & constraints:**
- Missing required fields → some tags are essential (title, description) while others are optional. Mark required fields and show which tags will be missing from the output.
- Image URL validity → the tool can't verify the image exists. Show a note that an invalid image URL will cause social previews to show no image.
- Very long URLs or descriptions → show how they'll be truncated on each platform.

**Performance notes:** Trivial.

**Overlap notes:** Overlaps with **Favicon Generator** (`favicon-gen`) in producing HTML `<link>` tags. In a unified app, Meta Tag Generator should include a "Favicon" section that either links to the Favicon Generator or allows pasting the Favicon Generator's output. The code display/copy UI is the shared `CodeBlock` component used by SVG Optimiser, Encoding Tools, and Regex Tester.

---

### 5D. Regex Tester
**ID:** `regex-tester`
**Complexity:** Medium

**Purpose:** A live environment for writing, testing, and debugging regular expressions against sample text. Provides real-time match highlighting, capture group extraction, and replace mode. Indispensable for developers, data analysts, and anyone working with text pattern matching.

**What a regex is:** A regular expression (regex) is a pattern-matching syntax used in programming to find, validate, extract, or replace text that matches specific patterns. For example, `\d{3}-\d{3}-\d{4}` matches US phone numbers like `555-123-4567`. Regex is supported in virtually every programming language and many text editors. It's powerful but notoriously difficult to read and debug — which is exactly why a tester tool is valuable.

**How it works:** The interface has three main areas:

1. **Pattern input** — where the user types their regex. Syntax errors are caught and displayed inline as the user types. Flag/modifier toggles are adjacent: `g` (global — find all matches, not just the first), `i` (case-insensitive), `m` (multiline — `^` and `$` match line starts/ends), `s` (dotAll — `.` matches newlines), `u` (unicode — proper Unicode handling).

2. **Test text area** — where the user pastes or types the text to search against. Matches are highlighted in real-time with alternating colors for adjacent matches so boundaries are clear. Capture groups within each match are highlighted with a secondary color.

3. **Results panel** — shows: total match count, a list of each match (with its text, index position, and length), and for each match, the captured groups (numbered groups like `$1`, `$2`, and named groups like `(?<n>...)`).

An optional **Replace mode** adds a replacement string input. The user types a replacement pattern (supporting backreferences like `$1` or `$<n>`), and a preview shows the full text with all replacements applied. The replaced text can be copied.

A collapsible **Cheat sheet** panel provides quick reference for regex syntax: character classes, quantifiers, anchors, groups, lookaheads/lookbehinds, common patterns.

**Inputs:** Regex pattern string, test text, flag toggles, optional replacement string.

**Outputs:** Highlighted matches in the text, match list with positions and groups, replacement preview, match count.

**Core logic:** JavaScript `RegExp` construction with error handling (`try { new RegExp(pattern, flags) } catch(e) { showError(e.message) }`). Match iteration using `regex.exec(text)` in a loop (for global flag) or `text.matchAll(regex)`. Match highlighting via splitting the test text into segments (matched and unmatched) and wrapping matched segments in styled spans. Replacement via `text.replace(regex, replacementString)`.

**Edge cases & constraints:**
- Catastrophic backtracking — certain regex patterns (e.g., `(a+)+b` against a long string of `a`s) can cause exponential processing time and freeze the browser. Implement a timeout: if `exec()` doesn't return within 1–2 seconds, abort and show a warning about backtracking. Run matching in a Web Worker to prevent UI freezing.
- Empty pattern → matches every position in the string (zero-width match). This is valid behavior but produces a lot of matches. Handle gracefully.
- Very large test text (100KB+) → highlighting thousands of matches may cause rendering performance issues. Limit visible highlights to the first N matches (e.g., 500) and note how many more exist.

**Performance notes:** The matching itself is fast for reasonable patterns and text sizes. The rendering of highlighted matches can be expensive if there are thousands — use virtualized rendering or cap the visible count. Catastrophic backtracking is the real risk — always use a timeout/Web Worker.

**Overlap notes:** No logic overlap with any other tool. The code/text input UI pattern and the cheat sheet sidebar pattern are generic components. The `CodeBlock` display component is shared.

---

## 6. Encoding Tools

**ID (section):** `encoder`
**Complexity:** Low

> These three sub-tools share an identical UI pattern: text input → process → text output with copy. They should be implemented as **tabs within a single Encoding Tools view** rather than three separate tools. This reduces navigation overhead and reflects how they're used — a developer working with encoded data often needs multiple encoding types in the same session.

### 6A. Base64 Encoder/Decoder
**ID:** `encoder-base64`

**Purpose:** Converts text to Base64 encoding and back. Commonly used for: embedding binary data in JSON or XML, data URIs in CSS/HTML (`data:image/png;base64,...`), HTTP Basic Auth headers, and email MIME encoding.

**How it works:** The user enters plain text (or pastes Base64-encoded text). A toggle switches between Encode and Decode mode. Output appears in a read-only field below, updated live as the user types. Copy button transfers output to clipboard.

**Inputs:** Text string, mode toggle (encode/decode).

**Outputs:** Converted string, copy button.

**Core logic:** For encoding: convert string to UTF-8 bytes via `TextEncoder`, then to Base64 via a `btoa()`-compatible approach that handles multi-byte characters (the raw `btoa()` only handles Latin-1). For decoding: Base64 → bytes via `atob()`, then bytes → string via `TextDecoder`. Handle invalid Base64 input gracefully (show an error, don't crash).

**Edge cases:** Non-ASCII text (emoji, CJK, accented characters) requires proper UTF-8 → Base64 encoding, not raw `btoa()`. Invalid Base64 input (wrong length, illegal characters) → show an inline error.

---

### 6B. URL Encoder/Decoder
**ID:** `encoder-url`

**Purpose:** Percent-encodes special characters for safe use in URLs, or decodes percent-encoded URLs back to readable text. Essential when constructing query strings, debugging URLs, or working with API parameters.

**How it works:** Same layout as Base64 tab. The user enters text or a URL. In Encode mode, special characters are replaced with `%XX` equivalents. In Decode mode, `%XX` sequences are converted back. Output updates live.

**Inputs:** Text string or URL, mode toggle (encode/decode).

**Outputs:** Encoded or decoded string, copy button.

**Core logic:** `encodeURIComponent()` for encoding (encodes everything except `A-Z a-z 0-9 - _ . ! ~ * ' ( )`). `decodeURIComponent()` for decoding. Also offer `encodeURI()` / `decodeURI()` as an alternative mode (encodes fewer characters, preserving URL structure like `:`, `/`, `?`, `#`). Let the user choose between "encode value" (component) and "encode full URL" (URI) modes.

**Edge cases:** Already-encoded text being double-encoded → provide a note. `decodeURIComponent` throws on malformed sequences (e.g., `%ZZ`) → catch and show error.

---

### 6C. Hash Generator
**ID:** `encoder-hash`

**Purpose:** Generates cryptographic hash digests of input text. Used for checksums, data integrity verification, comparing file contents, and understanding hash algorithms. This is a one-way operation — hashes cannot be reversed.

**How it works:** The user enters text. The tool immediately generates digests using multiple algorithms, displayed simultaneously:

- **MD5** — 128-bit, 32 hex characters. Legacy, not cryptographically secure, but still widely used for checksums.
- **SHA-1** — 160-bit, 40 hex characters. Deprecated for security but used in Git.
- **SHA-256** — 256-bit, 64 hex characters. Current standard for most applications.
- **SHA-384** — 384-bit, 96 hex characters.
- **SHA-512** — 512-bit, 128 hex characters.

Each hash is shown as a lowercase hexadecimal string with an individual copy button. A toggle can switch between lowercase and uppercase hex output.

**Inputs:** Text string.

**Outputs:** Hash values for all algorithms (hex strings), individual copy buttons, case toggle.

**Core logic:** Web Crypto API: `crypto.subtle.digest('SHA-256', encodedData)` for SHA family (convert result `ArrayBuffer` to hex string). MD5 is not supported by Web Crypto — use a lightweight JS implementation (e.g., `spark-md5` or a standalone function; ~2KB).

**Edge cases:** Empty string → produces valid hashes (the hash of empty input is well-defined for each algorithm). Very long input (megabytes of text) → hashing may take a noticeable moment. Show a brief processing indicator.

---

### Encoding Tools — Section Notes

The copy-to-clipboard function is the same shared utility used across the entire app. The text input/output layout is this section's unique UI pattern but could be abstracted into a reusable `TransformPanel` component (input area, process, output area, copy button) that other text-processing tools could use. The `CodeBlock` display component from SVG Optimiser and Meta Tag Generator is closely related but optimized for displaying code rather than arbitrary text — consider unifying these.

---

## Cross-Tool Workflows

These are cases where one tool's output naturally feeds into another. The app should make these transitions frictionless — ideally a "Send to [Tool]" button or link in the output area.

| From | To | Workflow |
|---|---|---|
| **Image Tracer** (`img-tracer`) | **SVG Optimiser** (`svg-optimiser`) | Traced SVGs often contain redundant data. After tracing, offer "Optimize SVG" to clean up the output. |
| **Harmony Generator** (`harmony-gen`) | **Contrast Checker** (`contrast-checker`) | After generating a harmony set, check whether any pair in the set meets WCAG contrast standards. Offer "Check contrast" on each pair. |
| **Harmony Generator** (`harmony-gen`) | **CVD Simulator** (`cvd-sim`) | After generating a palette, verify it remains distinguishable under color blindness. Offer "Simulate CVD" to send colors to the simulator. |
| **Contrast Checker** (`contrast-checker`) | **CVD Simulator** (`cvd-sim`) | After checking a color pair, see how the contrast holds up under CVD. Offer "View under CVD." |
| **Favicon Generator** (`favicon-gen`) | **Meta Tag Generator** (`meta-tag-gen`) | After generating favicons, the HTML link tags can be included in the Meta Tag Generator's output. Offer "Add to meta tags." |
| **Social Media Cropper** (`social-cropper`) | **Watermarker** (`watermarker`) | After cropping, watermark the result. Offer "Add watermark." |
| **Image Converter** (`img-converter`) | **SVG Optimiser** (`svg-optimiser`) | If converting to SVG (via tracing), the output can be optimized. Route through Image Tracer first if needed. |
| **Any Image tool** | **Image Converter** (`img-converter`) | After any image operation, offer format conversion if the output format isn't what the user wanted. |

---

## Shared Components & Modules (Deduplication Summary)

Build these once and reuse everywhere:

| Component / Module | Type | Used By | Notes |
|---|---|---|---|
| **`ImageUploader`** | UI Component | social-cropper, matte-gen, scroll-gen, watermarker, cvd-sim, favicon-gen, img-splitter, img-converter, artwork-enhancer, img-tracer | Drag-and-drop + click-to-upload. Supports single and multi-file modes. Shows preview thumbnails. Validates file type and size. |
| **`ColorInput`** | UI Component | harmony-gen, contrast-checker, cvd-sim, matte-gen, placeholder-gen, qr-gen, watermarker | Color picker + hex/RGB/HSL text fields. Synced bidirectionally. |
| **`colorConvert`** | Utility Module | harmony-gen, contrast-checker, cvd-sim, matte-gen, placeholder-gen, qr-gen | hex ↔ RGB ↔ HSL ↔ OKLCH ↔ Lab ↔ LCH conversion functions. Includes gamut clamping. |
| **`contrastRatio`** | Utility Function | contrast-checker, qr-gen | sRGB linearization + WCAG luminance + ratio calculation. Small enough to be part of `colorConvert`. |
| **`CanvasRenderer`** | Utility Module | social-cropper, matte-gen, scroll-gen, watermarker, favicon-gen, img-splitter, img-converter, artwork-enhancer, placeholder-gen | Wraps common canvas operations: load image, resize, crop, slice, draw text, composite, export to blob/dataURL. |
| **`canvasSlice`** | Utility Function | scroll-gen, img-splitter | Extract a rectangular region from a canvas. Part of `CanvasRenderer`. |
| **`BatchProcessor`** | Utility Module | watermarker, img-converter, scroll-gen, img-splitter | Queue-based processor: takes a list of items and a processing function, runs sequentially, emits progress callbacks, supports cancellation. |
| **`ZipGenerator`** | Utility Module | scroll-gen, img-splitter, watermarker, favicon-gen, img-converter | Wraps JSZip (or similar). Adds files to archive, generates and downloads. |
| **`ClipboardCopy`** | Utility Function | glyph-browser, encoder, svg-optimiser, meta-tag-gen, regex-tester, harmony-gen, contrast-checker, favicon-gen | `navigator.clipboard.writeText()` with fallback + toast notification. |
| **`CodeBlock`** | UI Component | svg-optimiser, encoder, meta-tag-gen, regex-tester, favicon-gen | Monospace text display with syntax highlighting (optional), line numbers (optional), copy button, and word wrap toggle. |
| **`typographyConvert`** | Utility Module | px-to-rem, typo-calc, line-height-calc | All unit conversion math (px, pt, rem, em, pica, cicero, didot, agate, mm, cm, in). Takes DPI and base font size as context. |
| **`FileDownloader`** | Utility Function | All tools that export files | Trigger browser download from a Blob or data URL. Consistent file naming. |
| **`TransformPanel`** | UI Component | encoder (all tabs) | Input textarea → output textarea with mode toggle and copy. Reusable for any text-in/text-out tool. |
| **`ImagePreview`** | UI Component | social-cropper, matte-gen, img-splitter, artwork-enhancer, cvd-sim, img-tracer | Before/after or split-view image comparison. Handles zoom, pan, and toggle between views. |

---

## App-Level Concerns

### Accessibility
Every tool in this app should be keyboard-navigable and screen-reader-friendly. The irony of building a Contrast Checker that itself fails accessibility standards should not be lost on anyone. Specific notes:
- All form inputs need proper `<label>` associations.
- Color pickers must have text input alternatives (not just visual selection).
- Image previews need alt text describing the operation performed.
- Pass/fail indicators must not rely on color alone (use icons + text labels).
- Focus management when switching between tools or tabs.
- All interactive elements reachable via Tab key, operable via Enter/Space.

### State & Navigation
- Each tool should have its own URL route (e.g., `/tools/contrast-checker`), supporting deep linking and browser back/forward.
- Tool state should be preserved in the URL where practical (e.g., `/tools/px-to-rem?value=24&base=16`) so results can be shared via link.
- No data is sent to a server. All processing is client-side, in-browser.
- Consider persisting user preferences (like DPI setting in Typography Calculator, base font size in PX to REM) across sessions via component state or — if the user opts in — a lightweight preference store.

### Responsive Design
- All tools must work on mobile (≥ 375px width) and desktop.
- Image tools need special attention — canvas previews must fit small screens without horizontal scrolling.
- Typography tools and Encoding Tools are text-heavy and naturally responsive.
- The Glyph Browser's character grid should adapt column count to viewport width.
- Color pickers should be usable on touch devices (no hover-dependent interactions).

### Data Privacy
- No analytics, no tracking, no server-side processing.
- File uploads never leave the browser. All processing is client-side.
- No cookies, no localStorage for user data (unless explicitly for a "recent items" feature, with user awareness).
- Make this promise visible in the UI — it's a feature, not fine print.

### Error Handling
- Every tool should handle malformed input gracefully — show an inline error message, never crash or show a blank screen.
- File upload errors (wrong type, too large, corrupt file) should produce specific, helpful messages.
- Browser capability detection: check for Web Crypto, canvas, Clipboard API, and WebP/AVIF support before relying on them. Show fallback messaging when a feature isn't available.
