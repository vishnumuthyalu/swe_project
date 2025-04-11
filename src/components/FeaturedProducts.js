import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';
import '../styles/FeaturedProducts.css';
import productData from '../assets/product_list.csv';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(productData);
        const csvData = await response.text();
        
        Papa.parse(csvData, {
          header: true,
          complete: (results) => {
            const allProducts = results.data.filter(product => product.ProductID); // Filter out empty entries
            
            // Select 5 random products
            const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
            const randomProducts = shuffled.slice(0, 5);
            
            setProducts(randomProducts);
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
    
    fetchProducts();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === products.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? products.length - 1 : prevIndex - 1
    );
  };

  if (loading) {
    return <div className="featured-loading">Loading featured products...</div>;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="featured-container">
      <h2 className="featured-title">Featured Products</h2>
      
      <div className="featured-carousel">
        <button 
          className="carousel-button prev" 
          onClick={prevSlide}
          aria-label="Previous product"
        >
          &lt;
        </button>
        
        <div className="featured-slider">
          {products.map((product, index) => (
            <div 
              key={product.ProductID}
              className={`featured-product ${index === currentIndex ? 'active' : ''}`}
              style={{ transform: `translateX(${(index - currentIndex) * 100}%)` }}
            >
              <div className="product-image-container">
                {/* Placeholder for future image */}
                <div className="product-placeholder">
                {product.ImageURL ? (
                  <img src={product.ImageURL} alt={product.Name} className="actual-image" />
                ) : (
                  <div className="placeholder-image">{product.Name.charAt(0)}</div>
                )}
                </div>
              </div>
              
              <div className="product-content">
                <h3 className="product-name">{product.Name}</h3>
                <p className="product-category">Category: {product.Category}</p>
                <p className="product-price">${product.Price}</p>
                <p className="product-description">{product.Description}</p>
                <Link to={`/product/${product.ProductID}`} className="view-product-btn">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          className="carousel-button next" 
          onClick={nextSlide}
          aria-label="Next product"
        >
          &gt;
        </button>
      </div>
      
      <div className="carousel-dots">
        {products.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedProducts;
