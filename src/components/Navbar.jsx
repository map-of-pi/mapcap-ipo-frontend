/**
 * Navbar Component
 * Top navigation bar featuring the MapCap brand and connection status.
 */
import React from 'react';

const Navbar = ({ status }) => {
  return (
    <nav className="main-navbar">
      <div className="nav-brand">
        <span className="brand-icon">💎</span>
        <span className="brand-name">MAPCAP <span className="gold-text">IPO</span></span>
      </div>
      <div className={`connection-badge ${status.includes('✅') ? 'online' : 'offline'}`}>
        {status}
      </div>
    </nav>
  );
};

export default Navbar;

