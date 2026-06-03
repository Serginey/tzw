export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-brand-icon">FE</div>
          <div>
            <div className="footer-brand-text">Fire Extinguisher Management System</div>
            <div className="footer-brand-sub">TZW LTD — Safety &amp; Compliance Division</div>
          </div>
        </div>

        <div className="footer-links">
          <span className="footer-link">Documentation</span>
          <div className="footer-divider" />
          <span className="footer-link">Support</span>
          <div className="footer-divider" />
          <span className="footer-link">Privacy Policy</span>
        </div>

        <div className="footer-copy">
          &copy; {year} TZW LTD. All rights reserved. &nbsp;|&nbsp; Version 1.0.0
        </div>
      </div>
    </footer>
  );
}
