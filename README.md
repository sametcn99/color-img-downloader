# 🎨 Color Studio - Advanced Color Picker & Image Generator

![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Material-UI](https://img.shields.io/badge/Material--UI-7.2.0-blue?logo=mui)

**Color Studio** is a professional-grade color picker and image generation tool built with modern web technologies. Create, manipulate, and export beautiful colors in multiple formats with an intuitive and powerful interface.

## ✨ Features

### 🎯 **Advanced Color Selection**

- **Interactive Color Wheel** - Visual color picking with precision controls
- **Multiple Input Methods** - Support for HEX, RGB, RGBA, HSL, HSLA, HSV, HSVA, CMYK, LAB, HWB, and LCH color formats
- **Real-time Preview** - Instant color visualization with live updates
- **Visual Sliders** - Intuitive RGB, HSL, and Alpha channel controls
- **Precise Numeric Inputs** - Direct value entry for exact color specification

### 🎨 **Professional Color Formats**

- **HEX** - Standard web format (#FF5722)
- **RGB/RGBA** - Standard RGB with alpha transparency
- **HSL/HSLA** - Hue, Saturation, Lightness with alpha
- **HSV/HSVA** - Hue, Saturation, Value with alpha
- **CMYK** - Cyan, Magenta, Yellow, Key (Black) for print
- **LAB** - Perceptually uniform color space
- **HWB** - Hue, Whiteness, Blackness
- **LCH** - Lightness, Chroma, Hue (polar LAB)

### 📥 **Powerful Export Options**

#### **Image Formats**

- **PNG** - High-quality with transparency support
- **JPEG** - Optimized file size with quality control
- **SVG** - Scalable vector format for perfect quality at any size

#### **Preset Dimensions**

- **Social Media Ready**
  - Instagram Post (1080×1080)
  - Instagram Story (1080×1920)
  - Facebook Post (1200×630)
  - Twitter Header (1500×500)
  - LinkedIn Banner (1584×396)
  - YouTube Thumbnail (1280×720)

- **Wallpapers & Backgrounds**
  - Desktop Wallpaper (1920×1080)
  - Mobile Wallpaper (1080×1920)
  - Square formats (512×512, 1024×1024, 2048×2048)

- **Custom Dimensions** - Any size from 1×1 to 4096×4096 pixels

### 🛠 **Technical Features**

- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Real-time Color Conversion** - Instant conversion between all color formats
- **Type-Safe Development** - Full TypeScript support
- **Modern UI Components** - Material-UI design system
- **Performance Optimized** - Built with Next.js 15 and React 19
- **Client-Side Generation** - No server required for image creation

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm, yarn, pnpm, or bun package manager

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/sametcn99/color-img-downloader.git
cd color-img-downloader
```

2. **Install dependencies**

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install

# Using bun
bun install
```

3. **Start the development server**

```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using pnpm
pnpm dev

# Using bun
bun dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗 **Project Structure**

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   └── ColorPicker/       # Color picker components
│       ├── ColorPicker.tsx      # Main color picker component
│       ├── ColorInputs.tsx      # Input controls for color values
│       ├── ColorPreview.tsx     # Color preview display
│       ├── ColorSliders.tsx     # RGB/HSL slider controls
│       ├── ColorWheel.tsx       # Interactive color wheel
│       ├── ColorWheelModal.tsx  # Modal wrapper for color wheel
│       └── DownloadControls.tsx # Export and download controls
├── types/
│   └── color.ts           # TypeScript type definitions
└── utils/
    ├── colorConversions.ts # Color format conversion utilities
    └── imageGeneration.ts  # Image generation and download logic
```

## 🎨 **Usage Examples**

### **Basic Color Selection**

1. Use the color wheel or sliders to select your desired color
2. View real-time preview and color values
3. Copy color codes in your preferred format

### **Precise Color Input**

1. Switch to the input mode
2. Enter exact values in HEX, RGB, HSL, or any supported format
3. Values are automatically converted to all other formats

### **Export Color as Image**

1. Select your desired image format (PNG, JPEG, SVG)
2. Choose from preset dimensions or enter custom size
3. Adjust quality settings (for JPEG)
4. Click download to generate and save the image

### **Social Media Assets**

1. Pick your brand colors
2. Select social media preset (Instagram, Facebook, etc.)
3. Download ready-to-use images for your posts

## 🛠 **Development**

### **Available Scripts**

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### **Technology Stack**

- **Framework**: Next.js 15.3.5 with App Router
- **UI Library**: React 19.0.0
- **Language**: TypeScript 5.x
- **Styling**: Material-UI 7.2.0 with Emotion
- **Build Tool**: Turbopack (Next.js built-in)
- **Code Quality**: Biome 2.1.1 for linting and formatting

### **Key Dependencies**

```json
{
  "@mui/material": "^7.2.0",        // Modern React UI framework
  "@mui/icons-material": "^7.2.0",  // Material Design icons
  "@emotion/react": "^11.14.0",     // CSS-in-JS library
  "next": "15.3.5",                 // React framework
  "react": "^19.0.0",               // UI library
  "typescript": "^5"                // Type safety
}
```

## 🎯 **Use Cases**

### **For Designers**

- Create color palettes for branding projects
- Generate solid color backgrounds for presentations
- Test color combinations and accessibility
- Export colors in professional formats (LAB, CMYK)

### **For Developers**

- Generate placeholder images for prototypes
- Create solid color assets for web projects
- Test CSS color values in real-time
- Convert between different color formats

### **For Content Creators**

- Create branded social media backgrounds
- Generate color swatches for mood boards
- Design consistent visual assets
- Export colors for video editing software

### **For Print Design**

- Work with CMYK color values
- Generate color references for printing
- Convert web colors to print-safe formats
- Create color calibration references

## 🌟 **Advanced Features**

### **Color Science**

- **Perceptually Uniform Color Spaces**: Support for LAB and LCH color spaces for professional color work
- **Gamut Conversion**: Automatic handling of color space conversions
- **Alpha Transparency**: Full support for transparency in all applicable formats

### **Performance**

- **Client-Side Generation**: All image generation happens in the browser
- **Optimized Rendering**: Efficient React rendering with minimal re-renders
- **Memory Management**: Proper cleanup of generated image resources

### **Accessibility**

- **Keyboard Navigation**: Full keyboard support for all controls
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **High Contrast**: Works well with system accessibility settings

## 📱 **Browser Support**

- **Chrome/Edge**: 90+ (full features)
- **Firefox**: 88+ (full features)
- **Safari**: 14+ (full features)
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+

## 🤝 **Contributing**

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### **Development Setup**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 **License**

This project is open source and available under the [MIT License](LICENSE).

## 🙏 **Acknowledgments**

- Built with [Next.js](https://nextjs.org/) - The React framework for production
- UI components from [Material-UI](https://mui.com/) - React components for faster development
- Color science algorithms inspired by various open-source color libraries
- Icons from [Material Design Icons](https://material-design-icons.github.io/Material-Design-Icons/)

---

**Made with ❤️ by [sametcn99](https://github.com/sametcn99)**

*Star ⭐ this repository if you find it helpful!*
