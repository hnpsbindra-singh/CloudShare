import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, HardDrive, Share2, FileText, Menu, X, Sparkles, LogIn, UserPlus } from 'lucide-react';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-nav-container">
          <Link to="/" className="sidebar-logo" style={{ padding: 0 }}>
            <span className="sidebar-logo-text landing-logo-text">Cloud<span>Share</span></span>
          </Link>

          <div className="landing-nav-links">
            <a href="#features" className="nav-link">
              <Sparkles size={15} className="nav-link-icon" /> Features
            </a>
            <a href="#security" className="nav-link">
              <ShieldCheck size={15} className="nav-link-icon" /> Security
            </a>
            <a href="#storage" className="nav-link">
              <HardDrive size={15} className="nav-link-icon" /> Storage
            </a>
          </div>

          <div className="landing-nav-actions">
            <Link to="/login" className="btn btn-ghost btn-sm landing-nav-signin">
              Sign in
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm landing-nav-cta">
              Get Started <ArrowRight size={15} />
            </Link>
            <button
              className="btn-icon landing-mobile-toggle"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <>
            <div className="landing-mobile-backdrop" onClick={() => setMobileMenuOpen(false)} />
            <div className="landing-mobile-menu">
              <a
                href="#features"
                className="landing-mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Sparkles size={18} style={{ color: '#0b57d0' }} />
                <span>Features</span>
              </a>
              <a
                href="#security"
                className="landing-mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShieldCheck size={18} style={{ color: '#dc2626' }} />
                <span>Security</span>
              </a>
              <a
                href="#storage"
                className="landing-mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HardDrive size={18} style={{ color: '#16a34a' }} />
                <span>Storage</span>
              </a>

              <div className="landing-mobile-divider" />

              <div className="landing-mobile-actions">
                <Link
                  to="/login"
                  className="btn btn-secondary btn-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn size={16} /> Sign in
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserPlus size={16} /> Get Started Free
                </Link>
              </div>
            </div>
          </>
        )}
      </nav>

      <header className="landing-hero">
        <div className="hero-badge">
          <Zap size={14} style={{ color: '#0b57d0' }} />
          <span>Next-Gen Cloud Storage</span>
        </div>

        <h1 className="hero-title">
          All your files. <br />
          <span>Organized & accessible everywhere.</span>
        </h1>

        <p className="hero-subtitle">
          Store, view, and share PDFs, Word documents, Excel sheets, and media with lightning-fast cloud delivery and Google Drive-like ease.
        </p>

        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary btn-full-width" style={{ height: 48, padding: '0 32px', fontSize: 15 }}>
            Get 1 GB Free Storage <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ height: 48, padding: '0 28px', fontSize: 15 }}>
            Sign In to Account
          </Link>
        </div>

        <div className="hero-mockup-container">
          <div className="hero-mockup-card">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <div className="mockup-title">CloudShare – My Drive</div>
            </div>

            <div className="mockup-body">
              <div className="mockup-sidebar">
                <div className="mockup-btn">+ New</div>
                <div className="mockup-nav-item active"><HardDrive size={16} /> My Drive</div>
                <div className="mockup-nav-item"><Share2 size={16} /> Shared</div>
                <div className="mockup-storage">
                  <div className="mockup-storage-bar" />
                  <span>340 MB of 1 GB used</span>
                </div>
              </div>

              <div className="mockup-content">
                <div className="mockup-folder-grid">
                  <div className="mockup-folder">📁 Project Documents</div>
                  <div className="mockup-folder">📁 Financial Reports</div>
                  <div className="mockup-folder">📁 Design Assets</div>
                </div>

                <div className="mockup-file-grid">
                  <div className="mockup-file doc"><FileText size={24} style={{ color: '#2563eb' }} /> Resume.docx</div>
                  <div className="mockup-file pdf"><FileText size={24} style={{ color: '#dc2626' }} /> Contract_2026.pdf</div>
                  <div className="mockup-file sheet"><FileText size={24} style={{ color: '#16a34a' }} /> Budget.xlsx</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="features" className="landing-features">
        <div className="section-header">
          <h2>Designed for Seamless File Management</h2>
          <p>Everything you need to store, preview, and share your personal files in one unified workspace.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon" style={{ background: '#e8f0fe', color: '#0b57d0' }}>
              <HardDrive size={24} />
            </div>
            <h3>Google Drive Workspace</h3>
            <p>Familiar grid and list views, compact folder pills, and single-click file interactions.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ background: '#fce8e6', color: '#dc2626' }}>
              <FileText size={24} />
            </div>
            <h3>Native Browser PDF Viewer</h3>
            <p>Open PDF files directly in your browser without extra downloads or viewer extensions.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ background: '#e6f4ea', color: '#16a34a' }}>
              <Share2 size={24} />
            </div>
            <h3>Instant Public Share Links</h3>
            <p>Generate clean web app links so anyone can view or download Word & Excel files with proper file extensions.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ background: '#fef7e0', color: '#d97706' }}>
              <ShieldCheck size={24} />
            </div>
            <h3>Cloudinary CDN Security</h3>
            <p>Files are stored securely with high-availability Cloudinary cloud delivery architecture.</p>
          </div>
        </div>
      </section>

      <section id="storage" className="landing-cta-section">
        <div className="cta-card">
          <h2>Ready to experience effortless cloud storage?</h2>
          <p>Create your free account today and get 1 GB of high-speed cloud storage instantly.</p>
          <Link to="/register" className="btn btn-primary" style={{ height: 48, padding: '0 32px', fontSize: 15, background: '#ffffff', color: '#0b57d0' }}>
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-container">
          <div className="sidebar-logo">
            <span className="sidebar-logo-text" style={{ fontSize: 20 }}>Cloud<span>Share</span></span>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} CloudShare Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
