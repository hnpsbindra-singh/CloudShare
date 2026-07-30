import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, ChevronRight, RefreshCw, Upload, CloudUpload } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import FileGrid, { SkeletonGrid } from '../components/FileGrid';
import Modal from '../components/Modal';
import UploadPanel from '../components/UploadPanel';
import MobileBottomNav from '../components/MobileBottomNav';
import { folderAPI, userAPI } from '../api';
import { useToast } from '../context/ToastContext';

export default function Drive() {
  const [searchParams] = useSearchParams();
  const [contents, setContents] = useState({ allFolders: [], allFiles: [] });
  const [folderStack, setFolderStack] = useState([]);
  const [view, setView] = useState('grid');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [storage, setStorage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [renameModal, setRenameModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [renameName, setRenameName] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [globalDrag, setGlobalDrag] = useState(false);
  const dragCounter = useRef(0);
  const searchTimeoutRef = useRef();
  const toast = useToast();

  useEffect(() => {
    const targetFolderId = searchParams.get('folderId');
    const targetFolderName = searchParams.get('name');
    if (targetFolderId && !folderStack.length) {
      setFolderStack([{ id: targetFolderId, name: targetFolderName || 'Shared Folder' }]);
    }
  }, [searchParams]);

  const currentFolderId = folderStack.length
    ? folderStack[folderStack.length - 1].id
    : null;

  const loadContents = useCallback(async () => {
    setLoading(true);
    try {
      const [contentsRes, storageRes] = await Promise.all([
        folderAPI.getContents(currentFolderId),
        userAPI.getStorageUsage().catch(() => ({ data: null })),
      ]);
      setContents(contentsRes.data || { allFolders: [], allFiles: [] });
      if (storageRes.data) setStorage(storageRes.data);
    } catch {
      toast.error('Failed to load drive contents');
    } finally {
      setLoading(false);
    }
  }, [currentFolderId]);

  useEffect(() => { loadContents(); }, [loadContents]);

  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await folderAPI.search(searchQuery);
        setSearchResults(res.data);
      } catch { toast.error('Search failed'); }
    }, 350);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounter.current += 1;
    if (e.dataTransfer.types && e.dataTransfer.types.includes('Files')) {
      setGlobalDrag(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setGlobalDrag(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setGlobalDrag(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setShowUpload(true);
    }
  };

  const openFolder = (folder) => {
    setSearchQuery('');
    setSearchResults(null);
    setFolderStack((prev) => [...prev, { id: folder.id, name: folder.folderName }]);
  };

  const navigateToBreadcrumb = (idx) => {
    if (idx === -1) { setFolderStack([]); return; }
    setFolderStack((prev) => prev.slice(0, idx + 1));
  };

  const getExt = (name = '') => name.split('.').pop().toLowerCase();

  const openFile = async (file) => {
    try {
      const res = await folderAPI.getFileUrl(file.id);
      const url = res.data;

      if (getExt(file.name) === 'pdf') {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        toast.info('Preparing download…');
        const response = await fetch(url);
        if (!response.ok) throw new Error('Fetch failed');
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.download = file.name || 'download';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      }
    } catch {
      toast.error('Could not open file');
    }
  };

  const handleRenameOpen = (item, isFolder) => {
    setRenameModal({ item, isFolder });
    setRenameName(item.folderName || item.name || '');
  };

  const handleRenameConfirm = async () => {
    if (!renameName.trim()) { toast.error('Name cannot be empty'); return; }
    try {
      if (renameModal.isFolder) {
        await folderAPI.renameFolder(renameModal.item.id, renameName.trim());
      } else {
        await folderAPI.renameFile(renameModal.item.id, renameName.trim());
      }
      toast.success('Renamed successfully');
      setRenameModal(null);
      loadContents();
    } catch (err) {
      toast.error(err.response?.data || 'Rename failed');
    }
  };

  const handleDeleteOpen = (item, isFolder = false) => {
    setDeleteModal({ item, isFolder });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return;
    setLoading(true);
    try {
      if (deleteModal.isFolder) {
        await folderAPI.deleteFolder(deleteModal.item.id);
        toast.success('Folder deleted');
      } else {
        await folderAPI.deleteFile(deleteModal.item.id);
        toast.success('File deleted');
      }
      setDeleteModal(null);
      loadContents();
    } catch (err) {
      toast.error(typeof err.response?.data === 'string' ? err.response.data : 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (item, isFolder) => {
    try {
      if (isFolder) {
        const folderLink = `${window.location.origin}/drive?folderId=${item.id}&name=${encodeURIComponent(item.folderName || 'Folder')}`;
        await navigator.clipboard.writeText(folderLink);
        toast.success(`Share link for "${item.folderName || 'Folder'}" copied to clipboard!`);
      } else {
        const fileLink = `${window.location.origin}/share/${item.id}?name=${encodeURIComponent(item.name || 'file')}`;
        await navigator.clipboard.writeText(fileLink);
        toast.success(`Share link for "${item.name}" copied to clipboard!`);
      }
    } catch {
      toast.error('Could not copy share link');
    }
  };

  const rawData = searchResults ?? contents;

  const filterFiles = (fileList = []) => {
    if (filterType === 'all') return fileList;
    if (filterType === 'folders') return [];
    return fileList.filter((f) => {
      const ext = getExt(f.name);
      if (filterType === 'docs') return ['doc', 'docx', 'txt', 'pdf', 'odt', 'pages', 'rtf'].includes(ext);
      if (filterType === 'imgs') return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
      if (filterType === 'pdfs') return ext === 'pdf';
      if (filterType === 'zips') return ['zip', 'rar', 'tar', 'gz', '7z'].includes(ext);
      return true;
    });
  };

  const filteredFolders = filterType === 'docs' || filterType === 'imgs' || filterType === 'pdfs' || filterType === 'zips'
    ? []
    : (rawData.allFolders || []);

  const filteredFiles = filterFiles(rawData.allFiles || []);

  return (
    <div
      className="app-layout"
      onDragEnter={handleDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {globalDrag && (
        <div className="global-drop-overlay">
          <CloudUpload size={64} style={{ color: '#0b57d0' }} />
          <div className="global-drop-title">Drop files anywhere to upload</div>
          <div className="global-drop-sub">Max file size allowed: 100 MB per file</div>
        </div>
      )}

      {mobileSidebarOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <Sidebar
        storage={storage}
        onUpload={() => { setMobileSidebarOpen(false); setShowUpload(true); }}
        onNewFolder={() => { setMobileSidebarOpen(false); setShowUpload(true); }}
        isOpen={mobileSidebarOpen}
      />

      <div className="content-area">
        <TopBar
          onSearch={setSearchQuery}
          searchValue={searchQuery}
          onMenuClick={() => setMobileSidebarOpen((o) => !o)}
        />

        <div className="content-header">
          {searchQuery ? (
            <div className="breadcrumb">
              <span className="breadcrumb-item active">Search results for "{searchQuery}"</span>
            </div>
          ) : (
            <div className="breadcrumb">
              <span
                className={`breadcrumb-item ${!folderStack.length ? 'active' : ''}`}
                onClick={() => navigateToBreadcrumb(-1)}
              >
                My Drive
              </span>
              {folderStack.map((f, i) => (
                <span key={f.id} style={{ display: 'flex', alignItems: 'center' }}>
                  <ChevronRight size={18} className="breadcrumb-sep" />
                  <span
                    className={`breadcrumb-item ${i === folderStack.length - 1 ? 'active' : ''}`}
                    onClick={() => navigateToBreadcrumb(i)}
                  >
                    {f.name}
                  </span>
                </span>
              ))}
            </div>
          )}

          <div className="content-actions">
            <button
              className="btn-icon"
              onClick={loadContents}
              title="Refresh"
              aria-label="Refresh"
              id="refresh-btn"
            >
              <RefreshCw size={18} />
            </button>

            <div className="view-toggle" role="group" aria-label="View mode">
              <button
                className={`view-toggle-btn ${view === 'grid' ? 'active' : ''}`}
                onClick={() => setView('grid')}
                title="Grid view"
                aria-label="Grid view"
                id="view-grid"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`}
                onClick={() => setView('list')}
                title="List view"
                aria-label="List view"
                id="view-list"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="filter-tabs">
          {[
            { id: 'all', label: 'All' },
            { id: 'folders', label: 'Folders' },
            { id: 'docs', label: 'Documents' },
            { id: 'imgs', label: 'Images' },
            { id: 'pdfs', label: 'PDFs' },
            { id: 'zips', label: 'Archives' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`filter-tab ${filterType === tab.id ? 'active' : ''}`}
              onClick={() => setFilterType(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="content-scroll">
          {loading ? (
            <SkeletonGrid view={view} />
          ) : !filteredFolders.length && !filteredFiles.length ? (
            <div className="empty-state">
              <svg className="empty-state-icon" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M3 7c0-1.1.9-2 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
              </svg>
              <div className="empty-state-title">
                {searchQuery ? 'No results found' : filterType !== 'all' ? 'No matching files' : 'This folder is empty'}
              </div>
              <div className="empty-state-desc">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Drag files anywhere or click "New" to upload'}
              </div>
              {!searchQuery && (
                <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => setShowUpload(true)} id="empty-new-btn">
                  <Upload size={16} /> Upload files
                </button>
              )}
            </div>
          ) : (
            <FileGrid
              folders={filteredFolders}
              files={filteredFiles}
              view={view}
              onFolderOpen={openFolder}
              onFileOpen={openFile}
              onRename={handleRenameOpen}
              onDelete={handleDeleteOpen}
              onShare={handleShare}
            />
          )}
        </div>
      </div>

      <MobileBottomNav onUpload={() => setShowUpload(true)} />

      <UploadPanel
        currentFolderId={currentFolderId}
        onSuccess={loadContents}
        isOpen={showUpload}
        onRequestClose={() => setShowUpload(false)}
      />

      {renameModal && (
        <Modal
          title={`Rename ${renameModal.isFolder ? 'Folder' : 'File'}`}
          onClose={() => setRenameModal(null)}
          actions={
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => setRenameModal(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleRenameConfirm} id="rename-confirm-btn">
                Rename
              </button>
            </>
          }
        >
          <div className="form-group">
            <label className="form-label" htmlFor="rename-input">New name</label>
            <input
              id="rename-input"
              className="form-input"
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameConfirm()}
              autoFocus
            />
          </div>
        </Modal>
      )}

      {deleteModal && (
        <Modal
          title={`Delete ${deleteModal.isFolder ? 'folder' : 'file'}?`}
          onClose={() => setDeleteModal(null)}
          actions={
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="btn btn-danger btn-sm" onClick={handleDeleteConfirm} id="delete-confirm-btn">
                Delete
              </button>
            </>
          }
        >
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
            Are you sure you want to delete{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>"{deleteModal.item.folderName || deleteModal.item.name}"</strong>?
            {deleteModal.isFolder
              ? ' Its subfolders and files will be unlinked and moved to My Drive root.'
              : ' This action cannot be undone.'}
          </p>
        </Modal>
      )}
    </div>
  );
}
