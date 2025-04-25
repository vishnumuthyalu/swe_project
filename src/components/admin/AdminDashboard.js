import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ProductManager from './ProductManager';
import DiscountManager from './DiscountManager';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="admin-logout-btn">
          Logout
        </button>
      </div>
      
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Manage Products
        </button>
        <button 
          className={`admin-tab ${activeTab === 'discounts' ? 'active' : ''}`}
          onClick={() => setActiveTab('discounts')}
        >
          Discount Codes
        </button>
      </div>
      
      <div className="admin-content">
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'discounts' && <DiscountManager />}
      </div>
    </div>
  );
};

export default AdminDashboard;