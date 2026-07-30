import {
  Folder, File, Image, Film, FileText, Music, Archive,
  FileSpreadsheet, FileCode
} from 'lucide-react';

export function getFileIcon(mimeType, name = '', size = 24) {
  const mime = (mimeType || '').toLowerCase();
  const ext = name.split('.').pop().toLowerCase();

  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext))
    return <Image size={size} className="icon-image" />;
  if (mime.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext))
    return <Film size={size} className="icon-video" />;
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext))
    return <Music size={size} className="icon-audio" />;
  if (mime === 'application/pdf' || ext === 'pdf')
    return <FileText size={size} className="icon-pdf" />;
  if (mime.includes('word') || ['doc', 'docx'].includes(ext))
    return <FileText size={size} className="icon-doc" />;
  if (mime.includes('sheet') || mime.includes('excel') || ['xls', 'xlsx', 'csv'].includes(ext))
    return <FileSpreadsheet size={size} className="icon-sheet" />;
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext))
    return <Archive size={size} className="icon-zip" />;
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json'].includes(ext))
    return <FileCode size={size} className="icon-file" />;
  return <File size={size} className="icon-file" />;
}

export function FolderIcon({ size = 24 }) {
  return <Folder size={size} className="icon-folder" />;
}

export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let value = bytes;
  while (value >= 1024 && i < units.length - 1) { value /= 1024; i++; }
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
