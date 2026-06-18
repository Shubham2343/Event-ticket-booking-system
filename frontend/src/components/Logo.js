import React from 'react';
import './Logo.css';

export default function Logo() {
  return (
    <span className="logo">
      <span className="logo-icon-container">
        <svg className="logo-icon-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#7c3aed', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#ec4899', stopOpacity: 1}} />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="32" height="32" rx="6" fill="url(#logoGradient)" opacity="0.1" stroke="url(#logoGradient)" strokeWidth="2"/>
          <path d="M12 14C12 13.448 12.448 13 13 13H27C27.552 13 28 13.448 28 14V26C28 26.552 27.552 27 27 27H13C12.448 27 12 26.552 12 26V14Z" fill="url(#logoGradient)"/>
          <circle cx="16" cy="20" r="2" fill="white"/>
          <circle cx="24" cy="20" r="2" fill="white"/>
        </svg>
      </span>
      <span className="logo-name">TicketFlow</span>
    </span>
  );
}
