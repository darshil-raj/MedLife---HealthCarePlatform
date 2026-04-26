import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [careDropdownOpen, setCareDropdownOpen] = useState(false);
  let dropdownTimeout = null;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openDropdown = () => {
    clearTimeout(dropdownTimeout);
    setCareDropdownOpen(true);
  };

  const closeDropdown = () => {
    dropdownTimeout = setTimeout(() => setCareDropdownOpen(false), 200);
  };

  const careLinks = [
    { path: '/doctors', label: 'Find Doctors', icon: '👨‍⚕️', desc: 'Search specialists' },
    { path: '/nearby-doctors', label: 'Nearby Clinics', icon: '📍', desc: 'GPS-based search' },
    { path: '/hospitals', label: 'Hospitals', icon: '🏥', desc: 'Beds & availability' },
  ];

  const mainLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/consultations', label: 'Consultations', icon: '📅' },
    { path: '/ai-assistant', label: 'AI Assistant', icon: '🤖' },
  ];

  const isActive = (path) => location.pathname === path;
  const isCareActive = careLinks.some(l => location.pathname === l.path);

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="logo-pulse"></div>
          <span className="logo-text">MedLife</span>
        </Link>

        {/* Offline Kit link - always visible */}
        <Link
          to="/offline-health-kit"
          className={`offline-kit-link ${isActive('/offline-health-kit') ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <span>📡</span> <span className="offline-label">Offline Kit</span>
        </Link>

        {isAuthenticated && (
          <>
            <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
              {mainLinks.slice(0, 1).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="nav-icon">{link.icon}</span>
                  <span className="nav-label">{link.label}</span>
                </Link>
              ))}

              {/* Find Care Dropdown */}
              <div
                className={`nav-dropdown ${careDropdownOpen ? 'open' : ''} ${isCareActive ? 'has-active' : ''}`}
                onMouseEnter={openDropdown}
                onMouseLeave={closeDropdown}
              >
                <button className={`nav-link dropdown-trigger ${isCareActive ? 'active' : ''}`}>
                  <span className="nav-icon">🩺</span>
                  <span className="nav-label">Find Care</span>
                  <span className="dropdown-arrow">▾</span>
                </button>
                <div className="dropdown-menu">
                  {careLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`dropdown-item ${isActive(link.path) ? 'active' : ''}`}
                      onClick={() => { setMobileMenuOpen(false); setCareDropdownOpen(false); }}
                    >
                      <span className="dropdown-icon">{link.icon}</span>
                      <div className="dropdown-text">
                        <span className="dropdown-label">{link.label}</span>
                        <span className="dropdown-desc">{link.desc}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {mainLinks.slice(1).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="nav-icon">{link.icon}</span>
                  <span className="nav-label">{link.label}</span>
                </Link>
              ))}

              {/* Emergency - special styling */}
              <Link
                to="/emergency"
                className={`nav-link emergency-link ${isActive('/emergency') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="nav-icon">🚨</span>
                <span className="nav-label">Emergency</span>
              </Link>
            </div>

            <div className="navbar-user">
              <div className="user-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="user-name">{user?.name}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>

            <button
              className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </>
        )}

        {!isAuthenticated && (
          <div className="navbar-auth">
            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
