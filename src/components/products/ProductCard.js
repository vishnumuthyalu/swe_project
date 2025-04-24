import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <div className="product-image">
        {product && product.ImageURL ? (
          <img src={product.ImageURL} alt={product.Name} className="product-image" />
        ) : (
          <div className="placeholder-image">{product && product.Name ? product.Name.charAt(0) : 'P'}</div>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product ? product.Name : 'Product Name'}</h3>
        <p className="product-price">${product ? product.Price : '0.00'}</p>
        <Link to={`/product/${product ? product.ProductID : ''}`} className="view-product-btn">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
