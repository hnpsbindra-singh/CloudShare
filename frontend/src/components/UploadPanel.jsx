import { useState, useRef, useCallback } from 'react';
import { CloudUpload, FolderPlus, X } from 'lucide-react';
import Modal from './Modal';
import { folderAPI } from '../api';
import { useToast } from '../context/ToastContext';

const MAX_FILE_SIZE = 100 * 1024 * 1024;

function UploadProgressPanel({ uploads, onClose }) {
  if (!uploads.length) return null;
  const allDone = uploads.every((u) => u.progress >= 100 || u.error);

  return (
    <div className="upload-progress-panel">
      <div className="upload-progress-header">
        <span>
          {allDone ? 'Upload complete' : `Uploading ${uploads.filter((u) => u.progress < 100 && !u.error).length} file(s)…`}
        </span>
        {allDone && (
          <button className="btn-icon" onClick={onClose} style={{ width: 28, height: 28 }}>
            <X size={16} />
          </button>
        )}
      </div>
      {uploads.map((u, i) => (
        <div key={i} className="upload-progress-item">
          <div className="upload-progress-name" title={u.name}>{u.name}</div>
          {u.error ? (
            <div style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 4 }}>{u.error}</div>
          ) : (
            <div className="upload-progress-bar-track">
              <div className="upload-progress-bar-fill" style={{ width: `${u.progress}%` }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function UploadPanel({ currentFolderId, onSuccess, isOpen, onRequestClose }) {
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [dragover, setDragover] = useState(false);
  const fileInputRef = useRef();
  const toast = useToast();

  const handleFiles = useCallback(async (files) => {
    const fileList = Array.from(files);
    if (!fileList.length) return;

    const startIdx = uploads.length;
    const newUploads = fileList.map((f) => {
      if (f.size > MAX_FILE_SIZE) {
        return { name: f.name, progress: 0, error: 'Exceeds maximum size of 100 MB' };
      }
      return { name: f.name, progress: 0, error: null };
    });

    setUploads((prev) => [...prev, ...newUploads]);
    onRequestClose();

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const idx = startIdx + i;

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds the maximum 100 MB limit.`);
        continue;
      }

      try {
        await folderAPI.uploadFile(file, currentFolderId, (pct) => {
          setUploads((prev) => {
            const next = [...prev];
            if (next[idx]) next[idx] = { ...next[idx], progress: pct };
            return next;
          });
        });
        setUploads((prev) => {
          const next = [...prev];
          if (next[idx]) next[idx] = { ...next[idx], progress: 100 };
          return next;
        });
      } catch (err) {
        const msg = err.response?.data;
        setUploads((prev) => {
          const next = [...prev];
          if (next[idx]) next[idx] = { ...next[idx], error: typeof msg === 'string' ? msg : 'Upload failed' };
          return next;
        });
      }
    }
    onSuccess();
  }, [currentFolderId, uploads.length, onSuccess, onRequestClose, toast]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) { toast.error('Enter a folder name'); return; }
    setCreatingFolder(true);
    try {
      await folderAPI.createFolder(currentFolderId, { folderName: folderName.trim() });
      toast.success('Folder created');
      setFolderName('');
      setShowFolderModal(false);
      onRequestClose();
      onSuccess();
    } catch (err) {
      const msg = err.response?.data;
      toast.error(typeof msg === 'string' ? msg : msg?.message || 'Failed to create folder');
    } finally {
      setCreatingFolder(false);
    }
  };

  const closeFolderModal = () => {
    setShowFolderModal(false);
    setFolderName('');
    onRequestClose();
  };

  return (
    <>
      {isOpen && !showFolderModal && (
        <Modal title="New" onClose={onRequestClose}>
          <button
            className="context-item"
            style={{ width: '100%', borderRadius: 'var(--radius-md)', marginBottom: 12, padding: '12px 16px', background: '#f0f4f9' }}
            onClick={() => setShowFolderModal(true)}
            id="new-folder-btn"
          >
            <FolderPlus size={20} style={{ color: 'var(--color-folder-icon)' }} />
            <span style={{ fontWeight: 500 }}>Create New Folder</span>
          </button>

          <div
            className={`dropzone ${dragover ? 'dragover' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
            onDragLeave={() => setDragover(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            aria-label="Upload files"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          >
            <div className="dropzone-icon-circle">
              <CloudUpload size={32} />
            </div>
            <div className="dropzone-title">
              Drag & drop files here, or <span className="dropzone-btn-browse">Browse</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
              Max allowed file size: <strong>100 MB</strong>
            </div>
            <div className="dropzone-pills">
              <span className="dropzone-pill">PDFs</span>
              <span className="dropzone-pill">Word (.docx)</span>
              <span className="dropzone-pill">Excel (.xlsx)</span>
              <span className="dropzone-pill">Images</span>
              <span className="dropzone-pill">ZIPs</span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            id="file-upload-input"
            onChange={(e) => {
              if (e.target.files?.length) handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </Modal>
      )}

      {showFolderModal && (
        <Modal
          title="New Folder"
          onClose={closeFolderModal}
          actions={
            <>
              <button className="btn btn-ghost btn-sm" onClick={closeFolderModal}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleCreateFolder} disabled={creatingFolder} id="create-folder-confirm">
                {creatingFolder ? <span className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> : 'Create'}
              </button>
            </>
          }
        >
          <div className="form-group">
            <label className="form-label" htmlFor="folder-name-input">Folder name</label>
            <input
              id="folder-name-input"
              className="form-input"
              placeholder="Untitled folder"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
          </div>
        </Modal>
      )}

      <UploadProgressPanel uploads={uploads} onClose={() => setUploads([])} />
    </>
  );
}
