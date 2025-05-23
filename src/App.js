import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Search from './pages/Search';
import Cancel from './pages/Cancel';
import Success from './pages/Success';

import { CartProvider } from './context/CartContext';
import { SearchProvider } from './context/SearchContext';
import { AuthProvider } from './context/AuthContext';
import './styles/global.css';




function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SearchProvider>
          <Router>
            <div className="App">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/search" element={<Search />} />
                <Route path="/Cancel" element={<Cancel />} />
                <Route path="/Success" element={<Success />} />
              </Routes>
            </div>
          </Router>
        </SearchProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
