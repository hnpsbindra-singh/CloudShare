import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Cloud, Download, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { folderAPI } from '../api';

export default function ShareView() {
  const { fileId } = useParams();
  const [searchParams] = useSearchParams();
  const fileName = searchParams.get('name') || 'shared_file';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloaded, setDownloaded] = useState(false);
  const [fileUrl, setFileUrl] = useState('');

  const getExt = (name = '') => name.split('.').pop().toLowerCase();
  const isPdf = getExt(fileName) === 'pdf';

  const triggerDownload = async (url) => {
    try {
      if (isPdf) {
        window.open(url, '_blank');
        setDownloaded(true);
        return;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      setDownloaded(true);
    } catch {
      // Fall back to direct link button
    }
  };

  useEffect(() => {
    async function loadFile() {
      setLoading(true);
      try {
        const res = await folderAPI.getFileUrl(fileId);
        const url = res.data;
        setFileUrl(url);
        // Only attempt auto-download on non-touch desktop browsers
        if (!('ontouchstart' in window)) {
          await triggerDownload(url);
        }
      } catch (err) {
        setError('Shared file not found or link has expired.');
      } finally {
        setLoading(false);
      }
    }
    loadFile();
  }, [fileId]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
      padding: '24px'
    }}>
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '36px',
        maxWidth: 480,
        width: '100%',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'center'
      }}>
        <div className="auth-logo" style={{ justifyContent: 'center', marginBottom: 24 }}>
          <span className="auth-logo-text">Cloud<span>Share</span></span>
        </div>

        {loading ? (
          <div>
            <div className="spinner" style={{ margin: '24px auto' }} />
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 15 }}>Preparing your file…</p>
          </div>
        ) : error ? (
          <div>
            <AlertCircle size={48} style={{ color: 'var(--color-error)', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>
              File Unavailable
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 24 }}>{error}</p>
            <Link to="/login" className="btn btn-primary btn-sm">Go to CloudShare</Link>
          </div>
        ) : (
          <div>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--color-surface-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--color-blue)'
            }}>
              <FileText size={32} />
            </div>

            <h2 style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              wordBreak: 'break-word',
              marginBottom: 4
            }}>
              {fileName}
            </h2>

            {downloaded && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                color: '#1e8e3e',
                margin: '12px 0 20px',
                background: '#e6f4ea',
                padding: '4px 12px',
                borderRadius: 16
              }}>
                <CheckCircle2 size={16} />
                {isPdf ? 'Opened in browser' : 'Downloaded successfully'}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center', marginTop: 16 }}>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                <Download size={18} /> {isPdf ? 'Open PDF in Browser' : 'Download / View File'}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
