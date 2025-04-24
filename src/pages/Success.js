import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Success.css';
import { CartContext } from '../context/CartContext';

const Success = () => {
    const { cartItems, clearCart } = useContext(CartContext);
    const navigate = useNavigate();
    
    useEffect(() => {
        const updateProductQuantities = async () => {
            try {
                // Get cart items from context or localStorage
                let itemsToUpdate = cartItems;
                
                // If cart is empty in context, try to get from localStorage
                if (!itemsToUpdate || itemsToUpdate.length === 0) {
                    const savedCart = localStorage.getItem('cartItems');
                    if (savedCart) {
                        try {
                            itemsToUpdate = JSON.parse(savedCart);
                            console.log('Retrieved cart items from localStorage:', itemsToUpdate);
                        } catch (error) {
                            console.error('Error parsing saved cart:', error);
                        }
                    }
                }
                
                // If we have items to update, proceed with the API call
                if (itemsToUpdate && itemsToUpdate.length > 0) {
                    console.log('Cart items to update quantities:', itemsToUpdate);
                    
                    // Format the items for the API request
                    const items = itemsToUpdate.map(item => ({
                        productId: item.ProductID,
                        quantity: item.quantity
                    }));
                    
                    console.log('Formatted items for API request:', items);
                    
                    // Call the server API to update quantities
                    const response = await fetch('http://localhost:5000/update-quantities', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ items })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    console.log('API response:', data);
                    
                    if (data.success) {
                        console.log('Product quantities updated successfully');
                        // Clear the cart after successful quantity update
                        clearCart();
                        // Also clear localStorage
                        localStorage.removeItem('cartItems');
                    } else {
                        console.error('Failed to update product quantities:', data.message);
                    }
                } else {
                    console.log('No items to update');
                }
            } catch (error) {
                console.error('Error updating product quantities:', error);
            }
        };
        
        // Call the function immediately
        updateProductQuantities();
        
        // Redirect to home page after 5 seconds
        const redirectTimer = setTimeout(() => {
            navigate('/');
        }, 5000);
        
        return () => clearTimeout(redirectTimer);
    }, [cartItems, navigate]);
    return(
        <div className="container">
            <div className="success-text">Payment has been Successful</div>
            <div className="check-circle">
                <div className="check-mark"></div>
            </div>  
        </div>
            
    );
};

export default Success;