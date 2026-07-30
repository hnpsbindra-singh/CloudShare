import { useState } from 'react';
import { MoreVertical, Share2, Pencil, Trash2 } from 'lucide-react';
import { getFileIcon, FolderIcon, formatDate, formatBytes } from '../utils/fileUtils';
import ContextMenu from './ContextMenu';

export function SkeletonGrid({ view = 'grid' }) {
  if (view === 'list') {
    return (
      <div className="file-list" style={{ opacity: 0.7 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-pill" style={{ marginBottom: 8, height: 44 }} />
        ))}
      </div>
    );
  }
  return (
    <>
      <div className="folder-grid" style={{ marginBottom: 24 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-pill" />
        ))}
      </div>
      <div className="file-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-card" />
        ))}
      </div>
    </>
  );
}

function FolderCard({ item, onOpen, onContextMenu }) {
  return (
    <div
      className="folder-card"
      onClick={() => onOpen(item)}
      onDoubleClick={() => onOpen(item)}
      onContextMenu={(e) => { e.preventDefault(); onContextMenu(e, item, true); }}
      role="button"
      tabIndex={0}
      aria-label={item.folderName}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(item)}
    >
      <FolderIcon size={20} />
      <span className="folder-card-name" title={item.folderName}>
        {item.folderName}
      </span>
      <button
        className="card-menu-btn"
        onClick={(e) => { e.stopPropagation(); onContextMenu(e, item, true); }}
        aria-label="More options"
      >
        <MoreVertical size={14} />
      </button>
    </div>
  );
}

function FileCard({ item, onOpen, onContextMenu }) {
  const icon = getFileIcon(item.mimeType, item.name, 44);

  return (
    <div
      className="file-card"
      onClick={() => onOpen(item)}
      onDoubleClick={() => onOpen(item)}
      onContextMenu={(e) => { e.preventDefault(); onContextMenu(e, item, false); }}
      role="button"
      tabIndex={0}
      aria-label={item.name}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(item)}
    >
      <div className="file-card-preview">
        {icon}
      </div>
      <div className="file-card-info">
        <span className="file-card-name" title={item.name}>
          {item.name}
        </span>
        <button
          className="card-menu-btn"
          onClick={(e) => { e.stopPropagation(); onContextMenu(e, item, false); }}
          aria-label="More options"
        >
          <MoreVertical size={14} />
        </button>
      </div>
    </div>
  );
}

function FileRow({ item, isFolder, onOpen, onContextMenu }) {
  const icon = isFolder
    ? <FolderIcon size={20} />
    : getFileIcon(item.mimeType, item.name, 20);

  return (
    <div
      className="file-list-row"
      onClick={() => onOpen(item)}
      onDoubleClick={() => onOpen(item)}
      onContextMenu={(e) => { e.preventDefault(); onContextMenu(e, item, isFolder); }}
      role="row"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(item)}
    >
      <div className="file-list-name">
        {icon}
        <span>{item.name || item.folderName}</span>
      </div>
      <div className="file-list-date">{formatDate(item.creationTime)}</div>
      <div className="file-list-actions">
        <button
          className="btn-icon"
          style={{ width: 32, height: 32 }}
          onClick={(e) => { e.stopPropagation(); onContextMenu(e, item, isFolder); }}
          aria-label="More options"
        >
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
}

export default function FileGrid({ folders, files, view, onFolderOpen, onFileOpen, onRename, onDelete, onShare }) {
  const [ctx, setCtx] = useState(null);

  const openCtx = (e, item, isFolder) => {
    setCtx({ x: e.clientX, y: e.clientY, item, isFolder });
  };

  const ctxItems = ctx
    ? [
        {
          icon: <Share2 size={16} />,
          label: 'Share',
          action: () => onShare(ctx.item, ctx.isFolder),
        },
        {
          icon: <Pencil size={16} />,
          label: 'Rename',
          action: () => onRename(ctx.item, ctx.isFolder),
        },
        'divider',
        {
          icon: <Trash2 size={16} />,
          label: 'Delete',
          action: () => onDelete(ctx.item, ctx.isFolder),
          danger: true,
        },
      ].filter(Boolean)
    : [];

  if (!folders?.length && !files?.length) return null;

  return (
    <>
      {view === 'list' ? (
        <div className="file-list">
          <div className="file-list-header" role="row">
            <div>Name</div>
            <div>Modified</div>
            <div />
          </div>
          {folders?.map((f) => (
            <FileRow key={f.id} item={f} isFolder onOpen={onFolderOpen} onContextMenu={openCtx} />
          ))}
          {files?.map((f) => (
            <FileRow key={f.id} item={f} isFolder={false} onOpen={onFileOpen} onContextMenu={openCtx} />
          ))}
        </div>
      ) : (
        <>
          {folders?.length > 0 && (
            <>
              <div className="section-label">Folders</div>
              <div className="folder-grid">
                {folders.map((f) => (
                  <FolderCard key={f.id} item={f} onOpen={onFolderOpen} onContextMenu={openCtx} />
                ))}
              </div>
            </>
          )}
          {files?.length > 0 && (
            <>
              <div className="section-label">Files</div>
              <div className="file-grid">
                {files.map((f) => (
                  <FileCard key={f.id} item={f} onOpen={onFileOpen} onContextMenu={openCtx} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {ctx && (
        <ContextMenu items={ctxItems} position={{ x: ctx.x, y: ctx.y }} onClose={() => setCtx(null)} />
      )}
    </>
  );
}
