import { useState, useCallback } from 'react';
import { Upload, Loader } from 'lucide-react';
import './ImageSegmentation.css';

const API_URL = 'https://peak-a-boo.onrender.com'; 

function ImageSegmentation() {
  const [originalImage, setOriginalImage] = useState(null);
  const [segmentedImage, setSegmentedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = useCallback(async (file) => {
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', file);

      // Explicitly log the URL we're using
      const url = `${API_URL}/segment`;
      console.log('Attempting upload to:', url);

      // Remove the hardcoded URL
      const response = await fetch(`${API_URL}/segment`, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'application/json',
          'Origin': 'http://localhost:3000'  // Add this
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to process image');
      }

      const data = await response.json();
      
      if (!data.image) {
        throw new Error('Invalid response from server');
      }

      setOriginalImage(URL.createObjectURL(file));
      setSegmentedImage(`data:image/png;base64,${data.image}`);
    } catch (err) {
      console.error('Upload error:', err);
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
    } else {
      setError('Please drop a valid image file');
    }
  }, [handleImageUpload]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <div className="container">
      <h1 className="title">Peakaboo Pixels</h1>

      <div 
        className="upload-container"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onClick={clearError}
      >
        <p className="upload-text">Upload your image to remove its background</p>
        <input
          type="file"
          id="imageInput"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              handleImageUpload(file);
            }
            e.target.value = ''; // Reset input
          }}
        />
        <label htmlFor="imageInput" className="upload-button">
          {loading ? (
            <span className="flex items-center">
              <Loader className="animate-spin mr-2" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Choose Image
            </span>
          )}
        </label>
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      {loading && (
        <div className="loading">
          <Loader className="animate-spin" />
          <p>Processing image... Please wait</p>
          <p className="text-sm text-gray-500">This may take up to 60 seconds</p>
        </div>
      )}

      {error && (
        <div className="error" onClick={clearError}>
          <p>{error}</p>
          <small>Click to dismiss</small>
        </div>
      )}

      {(originalImage || segmentedImage) && (
        <div className="image-grid">
          <div className="image-box">
            <h3 className="image-title">Original</h3>
            <div className="image-wrapper">
              {originalImage && (
                <img
                  src={originalImage}
                  alt="Original"
                  className="image"
                  onError={() => setError('Failed to load original image')}
                />
              )}
            </div>
          </div>

          <div className="image-box">
            <h3 className="image-title">Background Removed</h3>
            <div className="image-wrapper">
              {segmentedImage && (
                <img
                  src={segmentedImage}
                  alt="Processed"
                  className="image"
                  onError={() => setError('Failed to load processed image')}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageSegmentation;