import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-logo">E-Shop</Link>
        <ul className="nav-links">
          <li><Link to="/">HOME</Link></li>
          <li><Link to="/products">PRODUCTS</Link></li>
          <li><Link to="/services">SERVICES</Link></li>
          <li><Link to="/contact">CONTACT US</Link></li>
        </ul>
      </div>
      <div className="nav-right">
        <div className="search-bar">
          <input type="text" placeholder="Search..." />
          <button type="submit"><span role="img" aria-label="Search">🔍</span></button>
        </div>
        <div className="nav-icons">
          <Link to="/profile" className="nav-icon"><span role="img" aria-label="User Profile">👤</span></Link>
          <Link to="/cart" className="nav-icon"><span role="img" aria-label="Shopping Cart">🛒</span></Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
