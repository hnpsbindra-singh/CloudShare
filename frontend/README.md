# CloudShare Production Frontend

Production-grade SaaS web client for CloudShare built with React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand, Axios, and Lucide React.

## Features & Integration

- **Authentication & Security**:
  - Two-Step Registration with Brevo Email OTP verification.
  - JWT Bearer Authentication with automatic 401 session expiration handling.
  - Password Reset via Email OTP verification.
- **Hierarchical Asset Explorer**:
  - Recursive folder navigation with dynamic breadcrumbs.
  - Full Folder & File management (Create, Rename, Safe Delete).
  - Drag-and-drop & file upload with client-side storage quota validation.
  - Live search across owned files and folders.
  - Grid & List/Table view modes with responsive cards.
- **Spring AI Multimodal Assistant**:
  - Multimodal AI summarization for Audio, Documents, PDFs, and Source Code.
  - Uses Spring AI's per-file conversation memory.
  - Shimmering loading states, markdown presentation, and one-click copy.
- **Media Viewer**:
  - Native audio player for `.mp3`, `.wav`, `.m4a` files.
  - Image previewer and embedded PDF viewer.
  - Direct Cloudinary CDN download links.
- **Profile & Storage Quota**:
  - Real-time storage consumption meter with threshold warnings (>75% warning, >90% critical).
  - Personal profile editor (Name & 10-digit Phone).

## Getting Started

### 1. Install dependencies:
```bash
npm install
```

### 2. Start development server:
```bash
npm run dev
```
The application will start on `http://localhost:5173`. Requests to `/api/*` are automatically proxied to the Spring Boot backend on `http://localhost:8080`.

### 3. Production build:
```bash
npm run build
```
The optimized bundle will be compiled to `dist/`.
