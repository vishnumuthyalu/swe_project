import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { SearchContext } from '../context/SearchContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { cartCount } = useContext(CartContext);
  const { handleSearch } = useContext(SearchContext);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      handleSearch(searchTerm);
      navigate('/search');
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-logo">
          <img src="/e-shop_logo2.png" alt="E-Shop Logo" className="logo-image" />
        </Link>
        <ul className="nav-links">
          <li><Link to="/">HOME</Link></li>
          <li><Link to="/products">PRODUCTS</Link></li>
          <li><Link to="/services">SERVICES</Link></li>
          <li><Link to="/contact">CONTACT US</Link></li>
        </ul>
      </div>
      <div className="nav-right">
        <div className="search-bar">
          <form onSubmit={handleSearchSubmit}>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={handleInputChange}
            />
            <button type="submit"><span role="img" aria-label="Search">🔍</span></button>
          </form>
        </div>
        <div className="nav-icons">
          <Link to="/profile" className="nav-icon"><span role="img" aria-label="User Profile">👤</span></Link>
          <Link to="/cart" className="nav-icon cart-icon">
            <span role="img" aria-label="Shopping Cart">🛒</span>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
