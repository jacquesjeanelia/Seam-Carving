<div align="center">

# 🔧 Seam Carving Web App

Content-aware image resizing (seam carving) with a modern Next.js frontend + Python (OpenCV / NumPy / SciPy) backend worker.

![Seam Carving Illustration](public/sample-images/next.svg)

</div>

## ✨ Overview

This project implements the classic seam carving algorithm for content-aware image retargeting. Users can:

- Upload an image (PNG/JPEG/etc. → normalized to PNG)
- Choose target dimensions smaller than the original
- Pick an algorithm strategy (`dp` = dynamic programming / optimal seam, or `greedy` = locally minimal)
- Stream progress updates from the Python process back into the UI (Server Actions / Route Handlers + ReadableStream)
- Download / view the resized result

The core carving logic lives in `python/seam_carver.py` and is invoked by API route handlers under `app/api/*` using a spawned Python process inside a local virtual environment (`.venv`).

## 🗂 Tech Stack

| Layer            | Technology                                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| Frontend         | Next.js (App Router), React 18, TypeScript, Tailwind CSS, Headless UI, Zustand state store, react-hot-toast |
| Backend Routes   | Next.js Route Handlers (`/api/upload`, `/api/process`)                                                      |
| Image Processing | Python 3, OpenCV, NumPy, SciPy, Matplotlib (for optional maps)                                              |
| Streaming        | Server-sent like incremental JSON chunks over a `ReadableStream`                                            |
| State            | Custom hook `use_seam_carver` (Zustand)                                                                     |

## 🧠 Seam Carving Recap

Seam carving removes (or could insert) connected 8-neighbor pixel paths (seams) of minimal cumulative energy to reduce width/height while preserving salient content. Energy is computed here as the gradient magnitude via Sobel filters:

\( E(x,y) = \sqrt{(\partial I/\partial x)^2 + (\partial I/\partial y)^2} \)

Two strategies provided:

- `greedy`: Chooses the locally minimal next step each row (fast, suboptimal globally)
- `dp`: Dynamic programming computes cumulative energy table and backtracks optimal seam (slower, better quality)

## 📁 Directory Structure (Relevant Parts)

```
python/
	seam_carver.py        # Core SeamCarver class (energy, seam search, removal, resize)
	__init__.py           # CLI entrypoint invoked by Node spawn()
	requirements.txt      # Python dependencies
src/app/api/upload/route.ts    # Handles image upload + dimension probing via Python
src/app/api/process/route.ts   # Spawns seam carving process and streams progress
src/hooks/use_seam_carver.ts   # Frontend state machine & streaming parser
src/components/               # UI sections (upload, controls, results)
public/uploads/               # Incoming original images
public/outputs/processed-images/  # Resized outputs
```

## 🚀 Quick Start (Full Stack)

### 1. Clone & Install JS deps

```powershell
git clone <repo-url> Seam-Carving
cd Seam-Carving
npm install
```

### 2. Create Python Virtual Environment

```powershell
python -m venv .venv
./.venv/Scripts/Activate.ps1
pip install -r python/requirements.txt
```

### 3. Run Dev Server

```powershell
npm run dev
```

Visit: http://localhost:3000

### 4. Use the App

1. Upload an image (stored under `public/uploads/` as PNG)
2. Adjust target width/height (defaults to 80% of original set automatically)
3. Select algorithm (DP recommended for quality)
4. Start processing → watch the live progress bar
5. Download / inspect output

## 🧪 Running the Python Module Manually (Optional)

You can invoke the seam carver outside the web flow for testing:

```powershell
./.venv/Scripts/Activate.ps1
python -m python __init__.py <absolute-image-path> <newWidth> <newHeight> <algorithm>
# or (inside project root):
python python/__init__.py public/uploads/your_image.png 400 300 dp
```

Output written to `public/outputs/processed-images/<name>_resized_image.png`.

## 🔌 API Contract

### POST /api/upload

FormData: `image: File`
Response (200):

```jsonc
{
  "success": true,
  "filename": "example.png",
  "filePath": "/uploads/example.png",
  "originalDimensions": { "width": 1024, "height": 768 },
  "message": "Image uploaded successfully"
}
```

### POST /api/process

JSON Body:

```jsonc
{
  "filename": "example.png",
  "filePath": "/uploads/example.png",
  "oldHeight": 768,
  "oldWidth": 1024,
  "newHeight": 600,
  "newWidth": 800,
  "algorithm": "dp" // or "greedy"
}
```

Streaming Response: newline-delimited JSON objects of shape:

```jsonc
{ "type": "progress", "progress": 42, "message": "Processing... 42%" }
{ "type": "complete", "paths": {"processedImage": "/outputs/processed-images/example_resized_image.png"}, ... }
{ "type": "error", "message": "..." }
```

## 🏗 Architecture Notes

- Node spawns Python with fully-qualified venv interpreter path (`.venv/Scripts/python.exe` on Windows)
- Progress is obtained by Python printing `Progress: X%` during iterative seam removals
- Frontend reads the `ReadableStream`, splits on newlines, and incrementally updates state
- State is centralized via Zustand store (`useSeamCarver`) to keep UI components dumb
- Energy map and seam visualization utilities exist but some saving lines are commented (`__init__.py`) — can be re-enabled for richer outputs.

## ⚙️ Core Python Class (`SeamCarver`)

Key methods:

- `compute_energy()` – Sobel gradient magnitude.
- `find_seam_greedy()` – Row-by-row minimal choice.
- `find_seam_dp()` – Dynamic programming cumulative energy + backtrack.
- `remove_seam(seam)` – Paints seam (red) into `seams_map` and removes it.
- `resize(new_width, new_height, algorithm)` – Iteratively removes vertical seams then transposes to treat horizontal seam removal uniformly.
- `save_image(...)`, `save_energy_map(...)`, `save_seams(...)` – Output helpers.

Limitations / TODO inside code: `#FIXME` markers (e.g., seam visualization accumulation strategy could be refined).

## 🔍 Validation & Quality Ideas

Potential enhancements for reliability:

- Add Jest / Vitest tests for API route parameter validation logic.
- Add Python unit tests (e.g., assert seam length == image height, energy map shape preservation).
- Benchmark DP vs Greedy runtime and quality (residual SSIM vs original).

## 🛡 Error Handling

| Layer    | Failure                  | Current Handling     | Future Improvement                          |
| -------- | ------------------------ | -------------------- | ------------------------------------------- |
| Upload   | Missing/invalid file     | 400 JSON error       | Enforce max size, MIME sniffing             |
| Process  | Bad dimensions           | 400 JSON error       | Pre-calc feasible minimal size              |
| Python   | Non-zero exit            | Stream `error` event | Map Python traceback to user-friendly cause |
| Frontend | Parse errors from stream | Warn + skip chunk    | Show dev diagnostics panel                  |

## 📦 Scripts

```jsonc
"dev": "next dev"       // Start dev server
"build": "next build"   // Production build
"start": "next start"   // Run built app
"lint": "next lint"     // ESLint
```

## 🖥 Environment Assumptions

- Python 3.10+ recommended (matching packages in `requirements.txt`)
- Node 18+/20+
- Local execution writes into `public/` (suitable for dev; for multi-user prod use a storage bucket)

## 🔮 Roadmap / Future Enhancements

- Horizontal + vertical seam insertion for enlargement (not just reduction)
- Object protection / removal masks (assign infinite or zero energy)
- GPU acceleration (CuPy / WebGPU experiments)
- Progressive preview (show result every N seams)
- Energy map & seam overlay gallery (re-enable commented saves)
- Drag-to-select crop vs seam carve comparative mode
- Support for batch processing queue + job IDs

## 🤝 Contributing

1. Fork + create feature branch
2. Ensure Python + Node environments install cleanly
3. Run `npm run lint`
4. Add/update documentation where relevant
5. Open PR with clear before/after description & sample images

## 📄 License

Specify a license (MIT / Apache-2.0 / etc.). Currently UNLICENSED — please add one before distribution.

## 🧭 Troubleshooting

| Issue                   | Fix                                                                         |
| ----------------------- | --------------------------------------------------------------------------- |
| Python not found        | Activate venv & verify path in route handlers matches OS layout             |
| 0 width/height returned | Ensure OpenCV can read file; confirm write permissions to `public/uploads`  |
| Progress stuck          | Check Python stdout buffering (already flushed via `sys.stdout.flush()`)    |
| Incorrect colors        | Remember OpenCV reads BGR; further processing in frontend expects PNG as-is |

## 🙌 Acknowledgements

- Original Seam Carving paper: Avidan & Shamir (2007)
- Next.js Team & Vercel ecosystem
- OpenCV / NumPy / SciPy communities

---

Happy carving! 🪚
