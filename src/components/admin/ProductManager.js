import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import productData from '../../assets/product_list.csv';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    ProductID: '',
    Category: '',
    Name: '',
    Price: '',
    Description: '',
    Quantity: '',
    ImageURL: ''
  });
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });

  // Fetch products from CSV
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(productData);
        const csvData = await response.text();
        
        Papa.parse(csvData, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            setProducts(results.data);
            setLoading(false);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            setLoading(false);
            setStatusMessage({
              type: 'error',
              message: 'Failed to load products. Please try again.'
            });
          }
        });
      } catch (error) {
        console.error('Error fetching product data:', error);
        setLoading(false);
        setStatusMessage({
          type: 'error',
          message: 'Failed to load products. Please try again.'
        });
      }
    };
    
    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setShowAddForm(false);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowAddForm(true);
    // Generate new product ID (highest existing ID + 1)
    const maxId = Math.max(...products.map(p => parseInt(p.ProductID, 10) || 0));
    setFormData({
      ProductID: (maxId + 1).toString(),
      Category: '',
      Name: '',
      Price: '',
      Description: '',
      Quantity: '100', // Default quantity
      ImageURL: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    
    try {
      // Send the updated product to the server
      const response = await fetch('http://localhost:5000/update-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          productId: formData.ProductID,
          updatedProduct: formData 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      
      // Update local state
      setProducts(products.map(product => 
        product.ProductID === formData.ProductID ? formData : product
      ));
      
      setEditingProduct(null);
      setStatusMessage({
        type: 'success',
        message: 'Product updated successfully!'
      });
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setStatusMessage({ type: '', message: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Error updating product:', error);
      setStatusMessage({
        type: 'error',
        message: 'Failed to update product. Please try again.'
      });
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    try {
      // Send the new product to the server
      const response = await fetch('http://localhost:5000/add-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          newProduct: formData 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add product');
      }
      
      // Update local state
      setProducts([...products, formData]);
      
      setShowAddForm(false);
      setStatusMessage({
        type: 'success',
        message: 'Product added successfully!'
      });
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setStatusMessage({ type: '', message: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Error adding product:', error);
      setStatusMessage({
        type: 'error',
        message: 'Failed to add product. Please try again.'
      });
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setShowAddForm(false);
    setFormData({
      ProductID: '',
      Category: '',
      Name: '',
      Price: '',
      Description: '',
      Quantity: '',
      ImageURL: ''
    });
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="product-manager">
      <h2 className="admin-section-heading">Manage Products</h2>
      
      {statusMessage.message && (
        <div className={`status-message status-${statusMessage.type}`}>
          {statusMessage.message}
        </div>
      )}
      
      {!editingProduct && !showAddForm && (
        <button onClick={handleAddNew} className="admin-btn add-new-btn">
          Add New Product
        </button>
      )}
      
      {(editingProduct || showAddForm) ? (
        <div className="edit-product-form">
          <h3>{showAddForm ? 'Add New Product' : 'Edit Product'}</h3>
          <form onSubmit={showAddForm ? handleAddProduct : handleUpdateProduct} className="admin-form">
            <div className="form-group">
              <label htmlFor="ProductID">Product ID</label>
              <input
                type="text"
                id="ProductID"
                name="ProductID"
                value={formData.ProductID}
                className="form-control"
                disabled
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="Category">Category</label>
              <input
                type="text"
                id="Category"
                name="Category"
                value={formData.Category}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="Name">Name</label>
              <input
                type="text"
                id="Name"
                name="Name"
                value={formData.Name}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="Price">Price</label>
              <input
                type="number"
                step="0.01"
                id="Price"
                name="Price"
                value={formData.Price}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="Description">Description</label>
              <textarea
                id="Description"
                name="Description"
                value={formData.Description}
                onChange={handleInputChange}
                className="form-control"
                rows="4"
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="Quantity">Quantity</label>
              <input
                type="number"
                id="Quantity"
                name="Quantity"
                value={formData.Quantity}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="ImageURL">Image URL</label>
              <input
                type="text"
                id="ImageURL"
                name="ImageURL"
                value={formData.ImageURL}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="admin-btn success">
                {showAddForm ? 'Add Product' : 'Save Changes'}
              </button>
              <button 
                type="button" 
                className="admin-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="products-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.ProductID}>
                  <td>{product.ProductID}</td>
                  <td>{product.Name}</td>
                  <td>{product.Category}</td>
                  <td>${product.Price}</td>
                  <td>{product.Quantity}</td>
                  <td className="actions-cell">
                    <button 
                      className="admin-btn"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
