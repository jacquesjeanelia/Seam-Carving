# Seam Carving Web Application

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)](https://www.python.org/)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.11-green?logo=opencv)](https://opencv.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-ready web application implementing content-aware image resizing using the seam carving algorithm. Built with Next.js frontend and Python backend for high-performance image processing.

## Features

- **Content-Aware Resizing**: Intelligent image reduction that preserves important visual content
- **Multiple Algorithms**: Choose between greedy and dynamic programming approaches
- **Real-time Progress**: Live updates during processing with streaming API
- **Modern UI**: Responsive design with drag-and-drop image upload
- **Type-Safe**: Full TypeScript implementation with strict type checking
- **Production Ready**: Error handling, validation, and optimized performance

## Quick Start

### Prerequisites

- Node.js 18+ 
- Python 3.11+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/jacquesjeanelia/Seam-Carving.git
cd Seam-Carving

# Install Node.js dependencies
npm install

# Create Python virtual environment
python -m venv .venv

# Activate virtual environment (Windows)
.\.venv\Scripts\activate
# For macOS/Linux: source .venv/bin/activate

# Install Python dependencies
pip install -r python/requirements.txt
```

### Development

```bash
# Start the development server
npm run dev

# Open your browser
# Navigate to http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Algorithm Overview

Seam carving is a content-aware image resizing technique that removes or inserts seams (connected paths of pixels) to change image dimensions while preserving important content.

### Energy Function

The algorithm computes pixel energy using gradient magnitude:

```
E(x,y) = √[(∂I/∂x)² + (∂I/∂y)²]
```

### Algorithms Available

| Algorithm | Description | Time Complexity | Quality |
|-----------|-------------|-----------------|---------|
| **Greedy** | Locally optimal seam selection | O(n×m) | Fast, lower quality |
| **Dynamic Programming** | Globally optimal seam selection | O(n×m) | Slower, higher quality |

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js UI    │───▶│  API Routes     │───▶│  Python Worker  │
│                 │    │                 │    │                 │
│ • Upload        │    │ • /api/upload   │    │ • seam_carver.py│
│ • Controls      │    │ • /api/process  │    │ • OpenCV        │
│ • Progress      │    │ • Streaming     │    │ • NumPy         │
│ • Results       │    │                 │    │ • SciPy         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- React Hot Toast

**Backend**
- Next.js API Routes
- Python subprocess integration
- Streaming responses

**Image Processing**
- OpenCV
- NumPy
- SciPy
- Matplotlib

## API Documentation

### Upload Endpoint

**POST** `/api/upload`

Upload an image file for processing.

**Request:**
```typescript
FormData {
  image: File // Image file (PNG, JPEG, etc.)
}
```

**Response:**
```typescript
{
  success: boolean
  filename: string
  filePath: string
  originalDimensions: {
    width: number
    height: number
  }
  message: string
}
```

### Process Endpoint

**POST** `/api/process`

Start seam carving process with streaming progress updates.

**Request:**
```typescript
{
  filename: string
  filePath: string
  oldHeight: number
  oldWidth: number
  newHeight: number
  newWidth: number
  algorithm: "greedy" | "dp"
}
```

**Response:** Server-Sent Events stream
```typescript
// Progress update
{ type: "progress", progress: number, message: string }

// Completion
{ 
  type: "complete", 
  paths: { processedImage: string },
  dimensions: { originalWidth: number, originalHeight: number, newWidth: number, newHeight: number },
  algorithm: string,
  filename: string
}

// Error
{ type: "error", message: string }
```

## Usage Examples

### Basic Usage

1. **Upload Image**: Drag and drop or click to select an image
2. **Set Dimensions**: Adjust target width and height (must be smaller than original)
3. **Choose Algorithm**: Select between "greedy" (fast) or "dp" (quality)
4. **Process**: Click "Start Processing" and monitor real-time progress
5. **Download**: Save the processed image

### Python API

```python
from python.seam_carver import SeamCarver

# Initialize with image path
carver = SeamCarver("path/to/image.png")

# Resize image
resized = carver.resize(new_width=400, new_height=300, algorithm="dp")

# Save result
carver.save_image("output.png")

# Optional: Save energy map and seam visualization
carver.save_energy_map("energy.png")
carver.save_seams("seams.png")
```

## Project Structure

```
seam-carving/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload/route.ts      # Image upload handler
│   │   │   └── process/route.ts     # Processing with streaming
│   │   ├── results/page.tsx         # Results display page
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Main application page
│   ├── components/
│   │   ├── seam_carver_app.tsx      # Main app component
│   │   ├── upload_section.tsx       # File upload interface
│   │   ├── controls_section.tsx     # Algorithm and dimension controls
│   │   ├── processing_section.tsx   # Progress display
│   │   └── results_section.tsx      # Results viewer
│   ├── hooks/
│   │   └── use_seam_carver.ts       # State management hook
│   └── lib/
│       ├── types.ts                 # TypeScript type definitions
│       └── utils.ts                 # Utility functions
├── python/
│   ├── seam_carver.py              # Core seam carving implementation
│   ├── __init__.py                 # CLI entry point
│   └── requirements.txt            # Python dependencies
├── public/
│   ├── uploads/                    # Uploaded images
│   └── outputs/
│       └── processed-images/       # Processed results
├── package.json                    # Node.js dependencies and scripts
└── README.md                       # This file
```

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Optional: Configure upload limits
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FORMATS=png,jpg,jpeg,webp

# Optional: Python executable path override
PYTHON_EXECUTABLE=.venv/Scripts/python.exe
```

### Python Dependencies

Core dependencies in `python/requirements.txt`:

```
opencv-python==4.11.0.86
numpy==2.3.0
scipy==1.15.3
matplotlib==3.10.3
```

## Development

### Code Quality

```bash
# Lint TypeScript/JavaScript
npm run lint

# Type checking
npx tsc --noEmit

# Format code (if Prettier is configured)
npm run format
```

### Testing

```bash
# Run tests (when implemented)
npm test

# Python tests
python -m pytest python/tests/
```

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Error Handling

The application includes comprehensive error handling:

- **Client-side validation**: File type, size, and dimension checks
- **Server-side validation**: Parameter validation and sanitization
- **Python error handling**: Graceful failure with informative messages
- **Network resilience**: Retry logic and timeout handling

## Performance Considerations

### Optimization Strategies

- **Streaming Processing**: Real-time progress updates prevent UI blocking
- **Memory Management**: Efficient numpy array operations
- **Algorithm Selection**: Choose between speed (greedy) and quality (DP)
- **Image Format**: Automatic PNG conversion for consistent processing

### Benchmarks

| Image Size | Algorithm | Processing Time* | Memory Usage* |
|------------|-----------|------------------|---------------|
| 1920×1080  | Greedy    | ~5s             | ~200MB        |
| 1920×1080  | DP        | ~15s            | ~400MB        |
| 4K (3840×2160) | Greedy | ~20s            | ~800MB        |
| 4K (3840×2160) | DP     | ~60s            | ~1.5GB        |

*Approximate values on modern hardware

## Security

- Input validation and sanitization
- File type restrictions
- Size limits on uploads
- Path traversal prevention
- No execution of user-provided code

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Follow the installation instructions above
2. Create a new branch for your feature
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

- **Issues**: [GitHub Issues](https://github.com/jacquesjeanelia/Seam-Carving/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jacquesjeanelia/Seam-Carving/discussions)
- **Documentation**: This README and inline code comments

## Acknowledgments

- [Seam Carving for Content-Aware Image Resizing](https://faculty.runi.ac.il/arik/scweb/imret/index.html) - Original paper by Avidan & Shamir
- Next.js team for the excellent framework
- OpenCV community for computer vision tools
- Contributors and testers

## Roadmap

### Current Version (v1.0)
- ✅ Basic seam carving implementation
- ✅ Web interface with real-time progress
- ✅ Multiple algorithm support
- ✅ TypeScript integration

### Future Releases

**v1.1 - Enhanced Processing**
- [ ] Horizontal seam insertion for enlargement
- [ ] Object protection masks
- [ ] Batch processing support

**v1.2 - Advanced Features**
- [ ] GPU acceleration with WebGL
- [ ] Progressive preview during processing
- [ ] Advanced energy functions

**v2.0 - Enterprise Features**
- [ ] User authentication
- [ ] Cloud storage integration
- [ ] API rate limiting
- [ ] Analytics dashboard

---

<div align="center">

**Built with care by the Seam Carving Team**

[Star us on GitHub](https://github.com/jacquesjeanelia/Seam-Carving) • [Report Bug](https://github.com/jacquesjeanelia/Seam-Carving/issues) • [Request Feature](https://github.com/jacquesjeanelia/Seam-Carving/issues)

</div>
