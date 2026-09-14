import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">🏡</div>
          <div className="logo-text">
            <span className="logo-name">Farm House</span>
            <span className="logo-tagline">Relax · Reconnect · Rejuvenate</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/farmhouses" className="nav-link" onClick={() => setMenuOpen(false)}>Farm Houses</Link>
          <Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/farmhouses" className="nav-link" onClick={() => setMenuOpen(false)}>Gallery</Link>
          <Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>Contact</Link>

          {user ? (
            <>
              <Link to="/my-bookings" className="nav-link" onClick={() => setMenuOpen(false)}>My Bookings</Link>
              {user.role === 'OWNER' && (
                <Link to="/owner-dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              )}
              {(user.role === 'ADMIN' || user.role === 'SUPERADMIN') && (
                <Link to="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>Admin</Link>
              )}
              <span className="nav-user-welcome">Hi, {user.name?.split(' ')[0]}</span>
              <button onClick={handleLogout} className="nav-btn-login">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-btn-login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="nav-btn-signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
