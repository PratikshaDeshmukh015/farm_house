import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <div className="logo-icon">🏡</div>
          <div className="logo-text">
            <span className="logo-name">Farm House</span>
            <span className="logo-tagline">Relax · Reconnect · Rejuvenate</span>
          </div>
        </Link>

        {/* Desktop & Mobile Navigation Links */}
        <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            Home
          </NavLink>

          <NavLink
            to="/farmhouses"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            Farm Houses
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            About
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            Contact
          </NavLink>

          {/* User Auth Section */}
          {user ? (
            <div className="nav-user-actions">
              <NavLink
                to="/my-bookings"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
              >
                My Bookings
              </NavLink>

              {user.role === 'OWNER' && (
                <NavLink
                  to="/owner-dashboard"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Owner Panel
                </NavLink>
              )}

              {(user.role === 'ADMIN' || user.role === 'SUPERADMIN') && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Admin
                </NavLink>
              )}

              <span className="nav-user-welcome">Hi, {user.name?.split(' ')[0]}</span>
              <button onClick={handleLogout} className="nav-btn-logout">Logout</button>
            </div>
          ) : (
            <div className="nav-auth-buttons">
              <NavLink
                to="/login"
                className={({ isActive }) => `nav-btn-login ${isActive ? 'active-btn' : ''}`}
                onClick={closeMenu}
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="nav-btn-signup"
                onClick={closeMenu}
              >
                Sign Up
              </NavLink>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
