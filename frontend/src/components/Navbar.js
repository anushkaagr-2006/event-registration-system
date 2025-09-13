import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUserPlus, FaQrcode, FaUserShield } from 'react-icons/fa';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <h1 style={styles.brand}>Event Management System</h1>
        <div style={styles.links}>
          <Link 
            to="/register" 
            style={{
              ...styles.link,
              ...(location.pathname === '/register' ? styles.activeLink : {})
            }}
          >
            <FaUserPlus /> Register
          </Link>
          <Link 
            to="/scan" 
            style={{
              ...styles.link,
              ...(location.pathname === '/scan' ? styles.activeLink : {})
            }}
          >
            <FaQrcode /> Scan QR
          </Link>
          <Link 
            to="/admin" 
            style={{
              ...styles.link,
              ...(location.pathname === '/admin' ? styles.activeLink : {})
            }}
          >
            <FaUserShield /> Admin
          </Link>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    background: 'white',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    padding: '15px 0',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: {
    color: '#667eea',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  links: {
    display: 'flex',
    gap: '30px'
  },
  link: {
    color: '#666',
    textDecoration: 'none',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '8px 16px',
    borderRadius: '5px',
    transition: 'all 0.3s'
  },
  activeLink: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  }
};

export default Navbar;