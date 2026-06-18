import { useEffect, useRef, useState } from 'react';

export default function AuthControl({ user, onSignIn, onSignOut }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  if (!user) {
    return (
      <button className="auth-btn" onClick={onSignIn} title="Sign in with Google" aria-label="Sign in with Google">
        <svg className="auth-icon" viewBox="0 0 24 24" width="18" height="18">
          <path fill="currentColor" d="M12 12v3.6h5.04c-.22 1.3-1.6 3.8-5.04 3.8-3.04 0-5.52-2.52-5.52-5.4s2.48-5.4 5.52-5.4c1.73 0 2.9.74 3.56 1.37l2.43-2.34C16.62 6.18 14.5 5.2 12 5.2 7.5 5.2 3.8 8.86 3.8 13s3.7 7.8 8.2 7.8c4.73 0 7.86-3.32 7.86-8 0-.54-.06-.95-.13-1.36H12z"/>
        </svg>
      </button>
    );
  }

  const initial = (user.displayName || user.email || '?').charAt(0).toUpperCase();

  return (
    <div className="auth-control" ref={containerRef}>
      <button
        className="auth-avatar-btn"
        onClick={() => setMenuOpen((open) => !open)}
        title={user.displayName || user.email}
        aria-label="Account menu"
      >
        {user.photoURL ? (
          <img className="auth-avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
        ) : (
          <span className="auth-avatar auth-avatar-fallback">{initial}</span>
        )}
      </button>
      {menuOpen && (
        <div className="auth-menu">
          <div className="auth-menu-name">{user.displayName || user.email}</div>
          <button
            className="auth-menu-signout"
            onClick={() => {
              setMenuOpen(false);
              onSignOut();
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
