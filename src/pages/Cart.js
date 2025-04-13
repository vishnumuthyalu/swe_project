import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import '../styles/Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, calculateTotal } = useContext(CartContext);
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountMessage, setDiscountMessage] = useState('');

  // Set tax rate (8.25%)
  const TAX_RATE = 0.0825;

  // Calculate subtotal, tax, discount and total
  const subtotal = parseFloat(calculateTotal());
  const tax = subtotal * TAX_RATE;
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal + tax - discountAmount;

  // Handle discount code application
  const applyDiscountCode = () => {
    if (discountCode.toUpperCase() === 'FREE25') {
      setDiscount(25);
      setDiscountApplied(true);
      setDiscountMessage('25% discount applied successfully!');
    } else {
      setDiscount(0);
      setDiscountApplied(false);
      setDiscountMessage('Invalid discount code.');
    }
    
    // Clear the message after 3 seconds
    setTimeout(() => {
      setDiscountMessage('');
    }, 3000);
  };

  // Reset discount when cart changes
  useEffect(() => {
    setDiscount(0);
    setDiscountApplied(false);
    setDiscountCode('');
    setDiscountMessage('');
  }, [cartItems]);

  if (cartItems.length === 0) {
    return (
      <div className="page-container">
        <h1>CART</h1>
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <Link to="/products" className="continue-shopping">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>CART</h1>
      <div className="cart-container">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.ProductID} className="cart-item">
              <div className="cart-item-image">
                {item.ImageURL ? (
                  <img src={item.ImageURL} alt={item.Name} />
                ) : (
                  <div className="placeholder-image">{item.Name.charAt(0)}</div>
                )}
              </div>
              <div className="cart-item-details">
                <h3 className="cart-item-name">{item.Name}</h3>
                <p className="cart-item-price">${item.Price}</p>
              </div>
              <div className="cart-item-controls">
                <div className="quantity-control">
                  <button 
                    onClick={() => updateQuantity(item.ProductID, item.quantity - 1)}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.ProductID, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.ProductID)}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
              <div className="cart-item-total">
                ${(parseFloat(item.Price) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-item">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Tax (8.25%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          {discountApplied && (
            <div className="summary-item discount">
              <span>Discount (25%):</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-item">
            <span>Shipping:</span>
            <span>Free</span>
          </div>
          <div className="summary-item total">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          
          <div className="discount-code-container">
            <label htmlFor="discount-code">Discount Code</label>
            <div className="discount-code-input">
              <input
                type="text"
                id="discount-code"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Enter code"
              />
              <button onClick={applyDiscountCode}>Apply</button>
            </div>
            {discountMessage && (
              <p className={`discount-message ${discountApplied ? 'success' : 'error'}`}>
                {discountMessage}
              </p>
            )}
          </div>
          
          <button className="checkout-btn">Proceed to Checkout</button>
          <Link to="/products" className="continue-shopping">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;