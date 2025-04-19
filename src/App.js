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
import { CartProvider } from './context/CartContext';
import { SearchProvider } from './context/SearchContext';
import './styles/global.css';


function App() {
  return (
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
            </Routes>
          </div>
        </Router>
      </SearchProvider>
    </CartProvider>
  );
}

export default App;
