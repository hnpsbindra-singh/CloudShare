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

export async function triggerFileDownload(fileUrl, fileName) {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error('Fetch failed');
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = fileName || 'download';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  } catch {
    const anchor = document.createElement('a');
    anchor.href = fileUrl;
    anchor.download = fileName || 'download';
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
}

export async function openInNewTab(fileUrl, fileName) {
  const ext = (fileName || '').split('.').pop().toLowerCase();
  const viewableExts = ['json', 'pdf', 'txt', 'md', 'html', 'xml', 'csv', 'js', 'jsx', 'ts', 'tsx', 'css', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];

  if (!viewableExts.includes(ext)) {
    return triggerFileDownload(fileUrl, fileName);
  }

  const newWin = window.open('about:blank', '_blank');

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error('Fetch failed');
    const blob = await response.blob();

    let mimeType = blob.type;
    if (ext === 'json') mimeType = 'application/json';
    else if (['txt', 'md', 'csv', 'log'].includes(ext)) mimeType = 'text/plain;charset=utf-8';
    else if (ext === 'pdf') mimeType = 'application/pdf';
    else if (ext === 'svg') mimeType = 'image/svg+xml';
    else if (['jpg', 'jpeg'].includes(ext)) mimeType = 'image/jpeg';
    else if (ext === 'png') mimeType = 'image/png';
    else if (ext === 'html') mimeType = 'text/html;charset=utf-8';

    const typedBlob = new Blob([blob], { type: mimeType });
    const blobUrl = URL.createObjectURL(typedBlob);

    if (newWin && !newWin.closed) {
      newWin.location.href = blobUrl;
    } else {
      window.open(blobUrl, '_blank');
    }
  } catch {
    if (newWin && !newWin.closed) {
      newWin.location.href = fileUrl;
    } else {
      window.open(fileUrl, '_blank');
    }
  }
}
