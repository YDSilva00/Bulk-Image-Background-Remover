# Bulk Image Background Remover

A fast, modern, and private web application to remove backgrounds from bulk images (like signatures, documents, and portraits). Built with React and Vite, this tool uses `@imgly/background-removal` to process everything **100% locally in your browser** using WebAssembly and ONNX AI models. No images are ever uploaded to an external server.

## ✨ Features

- **Bulk Processing:** Drag and drop multiple images at once to process them in a queue.
- **Local AI:** Uses an in-browser ONNX model for background removal—ensuring complete privacy and avoiding API costs or limits.
- **ZIP Export:** Download all processed background-free images in a single ZIP file, or download them individually.
- **Modern UI:** A clean, responsive interface built with a sleek dark mode and glassmorphism design.

## 🚀 Getting Started

### Prerequisites

You'll need [Node.js](https://nodejs.org/) (v16 or higher) and npm installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YDSilva00/Bulk-Image-Background-Remover.git
   cd Bulk-Image-Background-Remover
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:5173/` to use the app.

## 🛠️ Built With

- [React](https://reactjs.org/) - UI framework
- [Vite](https://vitejs.dev/) - Lightning-fast frontend tooling
- [@imgly/background-removal](https://img.ly/showcases/background-removal) - AI model for removing backgrounds in-browser
- [JSZip](https://stuk.github.io/jszip/) - Zipping files on the client side
- [FileSaver.js](https://github.com/eligrey/FileSaver.js/) - Saving files on the client side
- [Lucide React](https://lucide.dev/) - Beautiful SVG icons

## 🔒 Privacy First

Unlike many background removal tools, this application does **not** rely on a cloud API. Your sensitive images (such as physical signatures) never leave your device. The AI inference happens directly on your CPU/GPU through WebAssembly.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
