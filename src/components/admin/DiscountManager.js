import React, { useState, useEffect } from 'react';

const DiscountManager = () => {
  const [discountCodes, setDiscountCodes] = useState([]);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(10);
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch discount codes from server
  const fetchDiscountCodes = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching discount codes from server...');
      
      const response = await fetch('http://localhost:5000/discount-codes');
      const data = await response.json();
      
      if (data.success) {
        console.log('Discount codes loaded successfully:', data.discountCodes);
        setDiscountCodes(data.discountCodes || []);
      } else {
        console.error('Failed to load discount codes:', data.error);
        setStatusMessage({
          type: 'error',
          message: data.error || 'Failed to load discount codes'
        });
      }
    } catch (error) {
      console.error('Error fetching discount codes:', error);
      setStatusMessage({
        type: 'error',
        message: 'Failed to connect to server'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load discount codes on component mount
  useEffect(() => {
    fetchDiscountCodes();
  }, []);

  const handleAddDiscount = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!newCode.trim()) {
      console.log('Validation error: Empty discount code');
      setStatusMessage({
        type: 'error',
        message: 'Please enter a discount code'
      });
      return;
    }
    
    if (isNaN(newDiscount) || newDiscount <= 0 || newDiscount > 100) {
      console.log('Validation error: Invalid discount percentage');
      setStatusMessage({
        type: 'error',
        message: 'Discount must be between 1 and 100'
      });
      return;
    }
    
    // Check if code already exists locally
    if (discountCodes.some(code => code.code === newCode.toUpperCase())) {
      console.log('Validation error: Discount code already exists');
      setStatusMessage({
        type: 'error',
        message: 'This discount code already exists'
      });
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Sending request to add discount code...');
      
      const requestBody = {
        code: newCode.toUpperCase(),
        discount: parseInt(newDiscount, 10)
      };
      
      console.log('Request body:', requestBody);
      
      const response = await fetch('http://localhost:5000/discount-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      // Get raw response
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid server response');
      }
      
      if (data.success) {
        console.log('Discount code added successfully:', data.discountCodes);
        setDiscountCodes(data.discountCodes || []);
        setNewCode('');
        setNewDiscount(10);
        
        setStatusMessage({
          type: 'success',
          message: 'Discount code added successfully!'
        });
      } else {
        console.error('Error from server:', data.error);
        setStatusMessage({
          type: 'error',
          message: data.error || 'Failed to add discount code'
        });
      }
    } catch (error) {
      console.error('Error adding discount code:', error);
      setStatusMessage({
        type: 'error',
        message: `Failed to connect to server: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
    
    // Clear status message after 5 seconds
    setTimeout(() => {
      setStatusMessage({ type: '', message: '' });
    }, 5000);
  };

  const toggleDiscountStatus = async (id) => {
    try {
      setIsLoading(true);
      console.log(`Toggling status for discount ID: ${id}`);
      
      const response = await fetch(`http://localhost:5000/discount-codes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('Status updated successfully:', data.discountCodes);
        setDiscountCodes(data.discountCodes || []);
        
        setStatusMessage({
          type: 'success',
          message: 'Discount code status updated!'
        });
      } else {
        console.error('Update error:', data.error);
        setStatusMessage({
          type: 'error',
          message: data.error || 'Failed to update discount code'
        });
      }
    } catch (error) {
      console.error('Error updating discount code:', error);
      setStatusMessage({
        type: 'error',
        message: 'Failed to connect to server'
      });
    } finally {
      setIsLoading(false);
    }
    
    // Clear status message after 5 seconds
    setTimeout(() => {
      setStatusMessage({ type: '', message: '' });
    }, 5000);
  };

  const removeDiscount = async (id) => {
    try {
      setIsLoading(true);
      console.log(`Removing discount ID: ${id}`);
      
      const response = await fetch(`http://localhost:5000/discount-codes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('Discount code removed successfully:', data.discountCodes);
        setDiscountCodes(data.discountCodes || []);
        
        setStatusMessage({
          type: 'success',
          message: 'Discount code removed!'
        });
      } else {
        console.error('Remove error:', data.error);
        setStatusMessage({
          type: 'error',
          message: data.error || 'Failed to remove discount code'
        });
      }
    } catch (error) {
      console.error('Error removing discount code:', error);
      setStatusMessage({
        type: 'error',
        message: 'Failed to connect to server'
      });
    } finally {
      setIsLoading(false);
    }
    
    // Clear status message after 5 seconds
    setTimeout(() => {
      setStatusMessage({ type: '', message: '' });
    }, 5000);
  };

  // Force a reload of discount codes
  const handleRefresh = () => {
    fetchDiscountCodes();
    setStatusMessage({
      type: 'info',
      message: 'Refreshing discount codes...'
    });
    
    setTimeout(() => {
      setStatusMessage({ type: '', message: '' });
    }, 3000);
  };

  return (
    <div className="discount-manager">
      <h2 className="admin-section-heading">Manage Discount Codes</h2>
      
      {statusMessage.message && (
        <div className={`status-message status-${statusMessage.type}`}>
          {statusMessage.message}
        </div>
      )}
      
      <div className="add-discount-form">
        <h3>Add New Discount Code</h3>
        <form onSubmit={handleAddDiscount} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="discountCode">Discount Code</label>
              <input
                type="text"
                id="discountCode"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="form-control"
                placeholder="e.g., SUMMER25"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="discountPercentage">Discount Percentage</label>
              <input
                type="number"
                id="discountPercentage"
                value={newDiscount}
                onChange={(e) => setNewDiscount(e.target.value)}
                className="form-control"
                min="1"
                max="100"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="form-buttons">
            <button 
              type="submit" 
              className="admin-btn success"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Discount Code'}
            </button>
            
            <button 
              type="button" 
              className="admin-btn"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Refresh List
            </button>
          </div>
        </form>
      </div>
      
      <div className="discount-codes-table">
        <h3>Current Discount Codes</h3>
        {isLoading && <p>Loading discount codes...</p>}
        {!isLoading && discountCodes.length === 0 && (
          <p>No discount codes found. Add your first one above!</p>
        )}
        {!isLoading && discountCodes.length > 0 && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discountCodes.map((code) => (
                <tr key={code.id}>
                  <td>{code.code}</td>
                  <td>{code.discount}%</td>
                  <td>
                    <span className={`status-badge ${code.isActive ? 'active' : 'inactive'}`}>
                      {code.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className={`admin-btn ${code.isActive ? '' : 'success'}`}
                      onClick={() => toggleDiscountStatus(code.id)}
                      disabled={isLoading}
                    >
                      {code.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      className="admin-btn danger"
                      onClick={() => removeDiscount(code.id)}
                      disabled={isLoading}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DiscountManager;