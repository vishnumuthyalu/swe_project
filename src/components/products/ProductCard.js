import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <div className="product-image">
        {product.ImageURL ? (
          <img src={product.ImageURL} alt={product.Name} className="product-image" />
        ) : (
          <div className="placeholder-image">{product.Name.charAt(0)}</div>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.Name}</h3>
        <p className="product-price">${product.Price}</p>
        <Link to={`/product/${product.ProductID}`} className="view-product-btn">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
