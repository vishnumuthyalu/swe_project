import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../../styles/ProductDetail.css';
import productData from '../../assets/product_list.csv';
import { CartContext } from '../../context/CartContext';
import Papa from 'papaparse';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Handle add to cart action
  const handleAddToCart = () => {
    addToCart(product);
    setAddedToCart(true);
    
    // Reset the "Added to cart" message after 2 seconds
    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  };
  
  useEffect(() => {
    // Function to fetch and find specific product
    const fetchProduct = async () => {
      try {
        const response = await fetch(productData);
        const csvData = await response.text();
        
        Papa.parse(csvData, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log('CSV parsing in ProductDetail:', results);
            const foundProduct = results.data.find(
              (product) => product.ProductID.toString() === id
            );
            
            if (foundProduct) {
              setProduct(foundProduct);
            }
            setLoading(false);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error fetching product data:', error);
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }
  
  if (!product) {
    return <div className="error">Product not found</div>;
  }
  
  return (
    <div className="product-detail-container">
      <div className="product-detail-nav">
        <Link to="/products" className="back-to-products">
          &larr; Back to Products
        </Link>
      </div>
      
      <div className="product-detail-content">
        <div className="product-detail-image-container">
          {product.ImageURL ? (
            <img src={product.ImageURL} alt={product.Name} className="product-image" />
          ) : (
            <div className="placeholder-detail-image">{product.Name.charAt(0)}</div>
          )}
        </div>
        
        <div className="product-detail-info">
          <h1 className="product-detail-name">{product.Name}</h1>
          <p className="product-detail-category">
            Category: <span>{product.Category}</span>
          </p>
          <p className="product-detail-price">${product.Price}</p>
          <p className="product-detail-quantity">Stock Available: <span>{product.Quantity}</span></p>
          <div className="product-detail-description">
            <h2>Description</h2>
            <p>{product.Description}</p>
          </div>
          <button 
            className={`add-to-cart-btn ${addedToCart ? 'added' : ''}`} 
            onClick={handleAddToCart}
          >
            {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;