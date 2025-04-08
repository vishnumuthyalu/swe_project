import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import '../../styles/ProductList.css';
import productData from '../../assets/product_list.csv';
import Papa from 'papaparse';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState(['all']);
  
  useEffect(() => {
    // Function to parse CSV data
    const fetchProducts = async () => {
      try {
        const response = await fetch(productData);
        const csvData = await response.text();
        
        Papa.parse(csvData, {
          header: true,
          complete: (results) => {
            const productList = results.data;
            setProducts(productList);
            setFilteredProducts(productList);
            
            // Extract unique categories
            const uniqueCategories = ['all', ...new Set(productList.map(product => product.Category))];
            setCategories(uniqueCategories);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
          }
        });
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Filter products when category changes
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => product.Category === selectedCategory);
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, products]);
  
  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };
  
  return (
    <div className="product-list-container">
      <div className="category-filter">
        <h2>Categories</h2>
        <div className="category-buttons">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      
      <div className="product-grid">
        {filteredProducts.map((product) => (
          <div key={product.ProductID} className="product-grid-item">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
