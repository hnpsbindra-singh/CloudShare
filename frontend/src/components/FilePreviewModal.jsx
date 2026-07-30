import { useState, useEffect } from 'react';
import { X, Download, ExternalLink, Share2, FileText, Loader2, AlertTriangle } from 'lucide-react';
import { folderAPI } from '../api';
import { getFileIcon, formatBytes, triggerFileDownload, openInNewTab } from '../utils/fileUtils';
import { useToast } from '../context/ToastContext';

export default function FilePreviewModal({ file, onClose, onShare }) {
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [textContent, setTextContent] = useState('');
  const [loadingText, setLoadingText] = useState(false);
  const toast = useToast();

  const getExt = (name = '') => name.split('.').pop().toLowerCase();
  const ext = getExt(file?.name);

  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
  const isPdf = ext === 'pdf';
  const isAudio = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(ext);
  const isVideo = ['mp4', 'webm', 'mov', 'mkv'].includes(ext);
  const isText = ['txt', 'md', 'json', 'js', 'jsx', 'ts', 'tsx', 'css', 'html', 'csv', 'log', 'xml', 'py'].includes(ext);
  const isOffice = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext);

  useEffect(() => {
    let isMounted = true;
    async function loadUrl() {
      if (!file?.id) return;
      setLoading(true);
      setError('');
      try {
        const res = await folderAPI.getFileUrl(file.id);
        if (!isMounted) return;
        const url = res.data;
        setFileUrl(url);

        if (isText && url) {
          setLoadingText(true);
          try {
            const textRes = await fetch(url);
            if (textRes.ok) {
              const text = await textRes.text();
              if (isMounted) setTextContent(text.slice(0, 100000)); // Cap at 100KB for UI speed
            }
          } catch {
            // Text fetch optional fallback
          } finally {
            if (isMounted) setLoadingText(false);
          }
        }
      } catch (err) {
        if (isMounted) setError('Failed to load file link');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadUrl();
    return () => { isMounted = false; };
  }, [file?.id, isText]);

  if (!file) return null;

  const googleDocsViewerUrl = fileUrl
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`
    : '';

  const handleDownload = () => {
    if (!fileUrl) return;
    toast.info('Downloading file…');
    triggerFileDownload(fileUrl, file.name);
  };

  const handleOpenNewTab = () => {
    if (!fileUrl) return;
    openInNewTab(fileUrl, file.name);
  };

  return (
    <div className="preview-modal-backdrop" onClick={onClose}>
      <div className="preview-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="preview-modal-header">
          <div className="preview-file-info">
            <span className="preview-file-icon">
              {getFileIcon(file.mimeType, file.name, 24)}
            </span>
            <div className="preview-file-meta">
              <span className="preview-file-name" title={file.name}>
                {file.name}
              </span>
              {file.size && (
                <span className="preview-file-size">{formatBytes(file.size)}</span>
              )}
            </div>
          </div>

          <div className="preview-actions">
            {fileUrl && (
              <button
                className="btn btn-ghost btn-sm preview-btn-action"
                onClick={handleOpenNewTab}
                title="Open in new tab"
              >
                <ExternalLink size={16} />
                <span className="preview-action-text">Open</span>
              </button>
            )}

            {fileUrl && (
              <button
                className="btn btn-ghost btn-sm preview-btn-action"
                onClick={handleDownload}
                title="Download file"
              >
                <Download size={16} />
                <span className="preview-action-text">Download</span>
              </button>
            )}

            {onShare && (
              <button
                className="btn btn-ghost btn-sm preview-btn-action"
                onClick={() => onShare(file, false)}
                title="Share link"
              >
                <Share2 size={16} />
              </button>
            )}

            <button
              className="btn-icon preview-close-btn"
              onClick={onClose}
              aria-label="Close preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="preview-modal-body">
          {loading ? (
            <div className="preview-status-state">
              <Loader2 size={36} className="spinner" />
              <p>Loading document preview…</p>
            </div>
          ) : error ? (
            <div className="preview-status-state">
              <AlertTriangle size={40} style={{ color: 'var(--color-error)' }} />
              <p>{error}</p>
              <button className="btn btn-secondary btn-sm" onClick={onClose}>
                Close
              </button>
            </div>
          ) : isImage ? (
            <div className="preview-image-wrapper">
              <img src={fileUrl} alt={file.name} className="preview-image-element" />
            </div>
          ) : isPdf ? (
            <div className="preview-pdf-wrapper">
              <iframe
                src={fileUrl}
                title={file.name}
                className="preview-iframe"
              />
            </div>
          ) : isAudio ? (
            <div className="preview-media-wrapper">
              <audio controls src={fileUrl} className="preview-audio-element">
                Your browser does not support audio playback.
              </audio>
            </div>
          ) : isVideo ? (
            <div className="preview-media-wrapper">
              <video controls src={fileUrl} className="preview-video-element">
                Your browser does not support video playback.
              </video>
            </div>
          ) : isText ? (
            <div className="preview-text-wrapper">
              {loadingText ? (
                <div className="preview-status-state">
                  <Loader2 size={24} className="spinner" />
                  <p>Reading text content…</p>
                </div>
              ) : (
                <pre className="preview-text-content">{textContent || 'No text content available.'}</pre>
              )}
            </div>
          ) : isOffice ? (
            <div className="preview-pdf-wrapper">
              <iframe
                src={googleDocsViewerUrl}
                title={file.name}
                className="preview-iframe"
              />
            </div>
          ) : (
            <div className="preview-status-state">
              <FileText size={48} style={{ color: 'var(--color-google-blue)', opacity: 0.8 }} />
              <h3>No preview available for this file type</h3>
              <p>You can open or download the file directly.</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleOpenNewTab}
                >
                  <ExternalLink size={16} /> Open File
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleDownload}>
                  <Download size={16} /> Download
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
