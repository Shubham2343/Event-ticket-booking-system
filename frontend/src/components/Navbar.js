import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/events/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/events/" className="navbar-brand">
          <Logo />
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/events/" className={`nav-link ${isActive('/events/') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            Events
          </Link>
          {user && (
            <Link to="/my-bookings/" className={`nav-link ${isActive('/my-bookings/') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              My Bookings
            </Link>
          )}
          {user ? (
            <div className="nav-user">
              <span className="user-name">{user.name}</span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Sign out</button>
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/login/" className="btn btn-outline btn-sm" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/register/" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Register</Link>
            </div>
          )}
        </div>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
