import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../../styles/ProductDetail.css';
import productData from '../../assets/product_list.csv';
import Papa from 'papaparse';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Function to fetch and find specific product
    const fetchProduct = async () => {
      try {
        const response = await fetch(productData);
        const csvData = await response.text();
        
        Papa.parse(csvData, {
          header: true,
          complete: (results) => {
            const foundProduct = results.data.find(
              (product) => product.ProductID === id
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
        <div className="product-detail-image">
          {product.ImageURL ? (
          <img src={product.ImageURL} alt={product.Name} className="product-detail-image" />
            ) : (
              <div className="placeholder-image">{product.Name.charAt(0)}</div>
            )}
        </div>
        
        <div className="product-detail-info">
          <h1 className="product-detail-name">{product.Name}</h1>
          <p className="product-detail-category">
            Category: <span>{product.Category}</span>
          </p>
          <p className="product-detail-price">${product.Price}</p>
          <div className="product-detail-description">
            <h2>Description</h2>
            <p>{product.Description}</p>
          </div>
          <button className="add-to-cart-btn">Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
