import { useState, useCallback } from 'react';
import { Upload, Loader } from 'lucide-react';
import './ImageSegmentation.css';

function ImageSegmentation() {
  const [originalImage, setOriginalImage] = useState(null);
  const [segmentedImage, setSegmentedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = useCallback(async (file) => {
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:5000/segment', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const data = await response.json();

      setOriginalImage(URL.createObjectURL(file));
      setSegmentedImage(`data:image/png;base64,${data.image}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  return (
    <div className="container">
      <h1 className="title">Peakaboo Pixels</h1>

      <div 
        className="upload-container"
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <p className="upload-text">Upload your image to remove it's background</p>
        <input
          type="file"
          id="imageInput"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleImageUpload(e.target.files[0])}
        />
        <label htmlFor="imageInput" className="upload-button">
          Choose Image
        </label>
      </div>

      {loading && (
        <div className="loading">
          <Loader className="animate-spin" />
          Processing image...
        </div>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {(originalImage || segmentedImage) && (
        <center><div className="image-grid">
          <div className="image-box">
            <h3 className="image-title">Peek</h3>
            <div className="image-wrapper">
              {originalImage && (
                <img
                  src={originalImage}
                  alt="Original"
                  className="image"
                />
              )}
            </div>
          </div>

          <div className="image-box">
            <h3 className="image-title">aBoo</h3>
            <div className="image-wrapper">
              {segmentedImage && (
                <img
                  src={segmentedImage}
                  alt="Segmented"
                  className="image"
                />
              )}
            </div>
          </div>
        </div></center>
      )}
    </div>
  );
}

export default ImageSegmentation;