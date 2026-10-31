export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const normalized = typeof dateString === 'string' ? dateString.replace(' ', 'T') : dateString;
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return String(dateString);
  }
}

export function getFileCategory(fileName: string): 'audio' | 'image' | 'video' | 'pdf' | 'code' | 'archive' | 'document' | 'other' {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac'].includes(ext)) return 'audio';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp'].includes(ext)) return 'image';
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'video';
  if (ext === 'pdf') return 'pdf';
  if (['js', 'ts', 'jsx', 'tsx', 'java', 'py', 'cpp', 'c', 'cs', 'go', 'rs', 'html', 'css', 'json', 'xml', 'sql', 'sh', 'yml', 'yaml'].includes(ext)) return 'code';
  if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ext)) return 'archive';
  if (['doc', 'docx', 'txt', 'rtf', 'odt', 'csv', 'xlsx', 'pptx'].includes(ext)) return 'document';

  return 'other';
}
