// src/components/layout/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-3" style={{
      display: 'flex',
      justifyContent: 'space-between',
    }}>
      <Link className="navbar-brand" to="/dashboard">TaskIt</Link>
      <Link className='nav-link' to='/' onClick={() => localStorage.removeItem('user')}>Log out</Link>
    </nav>
  );
};

export default Navbar;
