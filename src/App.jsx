import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, Trash2, Image as ImageIcon, CheckCircle, AlertCircle, Play } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import './index.css';

function App() {
  const [images, setImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragging');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragging');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragging');
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (files) => {
    const validImageFiles = files.filter(file => file.type.startsWith('image/'));
    
    const newImages = validImageFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      originalUrl: URL.createObjectURL(file),
      processedUrl: null,
      processedBlob: null,
      status: 'pending', // pending, processing, success, error
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const processImages = async () => {
    if (isProcessing) return;
    
    const pendingImages = images.filter(img => img.status === 'pending' || img.status === 'error');
    if (pendingImages.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    for (let i = 0; i < pendingImages.length; i++) {
      const img = pendingImages[i];
      
      setImages(prev => prev.map(item => 
        item.id === img.id ? { ...item, status: 'processing' } : item
      ));

      try {
        // Run background removal
        const blob = await removeBackground(img.file);
        const processedUrl = URL.createObjectURL(blob);

        setImages(prev => prev.map(item => 
          item.id === img.id ? { 
            ...item, 
            status: 'success', 
            processedUrl, 
            processedBlob: blob 
          } : item
        ));
      } catch (error) {
        console.error("Error processing image:", error);
        setImages(prev => prev.map(item => 
          item.id === img.id ? { ...item, status: 'error' } : item
        ));
      }
      
      setProgress(((i + 1) / pendingImages.length) * 100);
    }

    setIsProcessing(false);
  };

  const downloadAll = async () => {
    const processedImages = images.filter(img => img.status === 'success' && img.processedBlob);
    
    if (processedImages.length === 0) return;
    if (processedImages.length === 1) {
      // Download single file directly
      saveAs(processedImages[0].processedBlob, `nobg_${processedImages[0].name}.png`);
      return;
    }

    // Create zip for multiple files
    const zip = new JSZip();
    
    processedImages.forEach(img => {
      // Ensure the extension is .png
      const newName = `nobg_${img.name.replace(/\.[^/.]+$/, "")}.png`;
      zip.file(newName, img.processedBlob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'processed_signatures.zip');
  };

  const clearAll = () => {
    images.forEach(img => {
      URL.revokeObjectURL(img.originalUrl);
      if (img.processedUrl) URL.revokeObjectURL(img.processedUrl);
    });
    setImages([]);
  };

  const removeImage = (id) => {
    setImages(prev => {
      const imgToRemove = prev.find(img => img.id === id);
      if (imgToRemove) {
        URL.revokeObjectURL(imgToRemove.originalUrl);
        if (imgToRemove.processedUrl) URL.revokeObjectURL(imgToRemove.processedUrl);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="status-badge status-pending">Pending</span>;
      case 'processing': return <span className="status-badge status-processing"><span className="loader" style={{width: '10px', height: '10px', borderWidth: '2px', marginRight: '5px'}}></span>Processing</span>;
      case 'success': return <span className="status-badge status-success">Success</span>;
      case 'error': return <span className="status-badge status-error">Error</span>;
      default: return null;
    }
  };

  const stats = {
    total: images.length,
    processed: images.filter(i => i.status === 'success').length,
    pending: images.filter(i => i.status === 'pending').length
  };

  return (
    <div className="app-container">
      <header>
        <h1>Signature Extractor</h1>
        <p>Bulk remove backgrounds from signatures and documents instantly</p>
      </header>

      <main className="main-content">
        <div 
          className="upload-zone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileInput} 
            multiple 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
          <Upload className="upload-icon" />
          <h3>Drag & Drop signature images here</h3>
          <p>or click to browse files</p>
          <button className="btn btn-secondary">Select Files</button>
        </div>

        {images.length > 0 && (
          <div className="controls-panel">
            <div className="stats">
              <div className="stat-item">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total Files</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.processed}</span>
                <span className="stat-label">Processed</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn btn-secondary" 
                onClick={clearAll}
                disabled={isProcessing}
              >
                <Trash2 size={18} /> Clear All
              </button>
              
              {stats.pending > 0 && (
                <button 
                  className="btn" 
                  onClick={processImages}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <><span className="loader"></span> Processing ({Math.round(progress)}%)</>
                  ) : (
                    <><Play size={18} /> Process All</>
                  )}
                </button>
              )}
              
              {stats.processed > 0 && !isProcessing && (
                <button 
                  className="btn" 
                  style={{ backgroundColor: 'var(--success-color)' }}
                  onClick={downloadAll}
                >
                  <Download size={18} /> Download ZIP
                </button>
              )}
            </div>
          </div>
        )}

        {images.length > 0 && (
          <div className="image-grid">
            {images.map(img => (
              <div className="image-card" key={img.id}>
                <div style={{ position: 'relative' }}>
                  <img 
                    src={img.processedUrl || img.originalUrl} 
                    alt={img.name} 
                    className="image-preview" 
                  />
                  {!isProcessing && (
                    <button 
                      onClick={() => removeImage(img.id)}
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: 'rgba(0,0,0,0.5)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="image-card-info">
                  <div className="image-name" title={img.name}>{img.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    {getStatusBadge(img.status)}
                    {img.status === 'success' && (
                      <button 
                        onClick={() => saveAs(img.processedBlob, `nobg_${img.name}.png`)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary-color)',
                          cursor: 'pointer'
                        }}
                        title="Download single"
                      >
                        <Download size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <footer className="footer">
        Powered by ONNX and WebAssembly. Processing happens completely locally in your browser.
      </footer>
    </div>
  );
}

export default App;
