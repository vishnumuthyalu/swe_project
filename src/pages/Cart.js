import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import '../styles/Cart.css';
import { loadStripe } from '@stripe/stripe-js';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, calculateTotal } = useContext(CartContext);
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountMessage, setDiscountMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Set tax rate (8.25%)
  const TAX_RATE = 0.0825;

  // Calculate subtotal, tax, discount and total
  const subtotal = parseFloat(calculateTotal());
  const discountAmount = subtotal * (discount / 100);
  const subtotalAfterDiscount = subtotal - discountAmount;
  const tax = subtotalAfterDiscount * TAX_RATE;  // Tax now calculated on discounted amount
  const total = subtotalAfterDiscount + tax;

  // Get effective price (sales price or regular price)
  const getEffectivePrice = (item) => {
    if (item.EffectivePrice !== undefined) {
      return item.EffectivePrice;
    }
    if (item.SalesPrice && item.SalesPrice.trim() !== '') {
      return parseFloat(item.SalesPrice);
    }
    return parseFloat(item.Price);
  };

  // Handle discount code application
  const applyDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountMessage('Please enter a discount code');
      setTimeout(() => setDiscountMessage(''), 3000);
      return;
    }
    
    try {
      setIsVerifying(true);
      console.log(`Verifying discount code: ${discountCode}`);
      
      // Call the verify-discount API
      const response = await fetch('http://localhost:5000/verify-discount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: discountCode
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.valid) {
          setDiscount(data.discount);
          setDiscountApplied(true);
          setDiscountMessage(`${data.discount}% discount applied successfully!`);
          console.log(`Discount applied: ${data.discount}%`);
        } else {
          setDiscount(0);
          setDiscountApplied(false);
          setDiscountMessage('Invalid discount code.');
          console.log('Invalid discount code');
        }
      } else {
        setDiscount(0);
        setDiscountApplied(false);
        setDiscountMessage('Error verifying discount code.');
        console.log(`Server error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error verifying discount code:', error);
      setDiscount(0);
      setDiscountApplied(false);
      setDiscountMessage('Failed to connect to server.');
    } finally {
      setIsVerifying(false);
    }
    
    // Clear the message after 3 seconds
    setTimeout(() => {
      setDiscountMessage('');
    }, 5000);
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

  const makePayment = async () => {
    try {
      console.log('Initializing payment process...');
      
      const stripe = await loadStripe("pk_test_51REYGhIGSn9lquIYlo7cstx2dl5JpBqQJ79DcUGDQxLsq3mzNVKuXMbSAx3b0X23SpbQnuXAViJdZTPsH7Ek5eYY00Giwk2Huu");

      const discountDecimal = discount / 100;
      console.log(`Discount decimal: ${discountDecimal}`);

      const requestBody = {
        items: cartItems.map(item => ({
          name: item.Name,
          price: getEffectivePrice(item), // Use effective price
          quantity: item.quantity
        })),
        taxRate: TAX_RATE,
        discountRate: discountDecimal
      };
      
      console.log(`Request body: ${JSON.stringify(requestBody)}`);

      const response = await fetch('http://localhost:5000/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const session = await response.json();
      console.log(`Session ID: ${session.id}`);

      const result = stripe.redirectToCheckout({
        sessionId: session.id
      });
    } catch (error) {
      console.error('Full error details (Caught in Cart.js):', error);
    }
  };

  return (
    <div className="page-container">
      <h1>CART</h1>
      <div className="cart-container">
        <div className="cart-items">
          {cartItems.map((item) => {
            const effectivePrice = getEffectivePrice(item);
            const isOnSale = item.IsSalePrice || (item.SalesPrice && item.SalesPrice.trim() !== '');
            const regularPrice = parseFloat(item.Price);
            
            return (
              <div key={item.ProductID} className="cart-item">
                <div className="cart-item-image">
                  {item.ImageURL ? (
                    <img src={item.ImageURL} alt={item.Name} />
                  ) : (
                    <div className="placeholder-image">{item.Name.charAt(0)}</div>
                  )}
                  {isOnSale && (
                    <div className="cart-sale-badge">SALE</div>
                  )}
                </div>
                <div className="cart-item-details">
                  <h3 className="cart-item-name">{item.Name}</h3>
                  <div className="cart-item-price-container">
                    {isOnSale ? (
                      <>
                        <span className="cart-item-original-price strike">${regularPrice.toFixed(2)}</span>
                        <span className="cart-item-sale-price">${effectivePrice.toFixed(2)}</span>
                      </>
                    ) : (
                      <p className="cart-item-price">${effectivePrice.toFixed(2)}</p>
                    )}
                  </div>
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
                  ${(effectivePrice * item.quantity).toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-item">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {discountApplied && (
            <div className="summary-item discount">
              <span>Discount ({discount}%):</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-item">
            <span>Tax (8.25%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
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
                disabled={isVerifying}
              />
              <button 
                onClick={applyDiscountCode}
                disabled={isVerifying}
              >
                {isVerifying ? 'Verifying...' : 'Apply'}
              </button>
            </div>
            {discountMessage && (
              <p className={`discount-message ${discountApplied ? 'success' : 'error'}`}>
                {discountMessage}
              </p>
            )}
          </div>
          
          <button 
            onClick={makePayment}
            className="checkout-btn"
            disabled={isVerifying}
          >
            Proceed to Checkout
          </button>
          <Link to="/products" className="continue-shopping">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;