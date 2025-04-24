import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from './ProductCard';
import '../../styles/ProductList.css';
import productData from '../../assets/product_list.csv';
import Papa from 'papaparse';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState(['all']);
  const [sortBy, setSortBy] = useState('default');
  const [originalProducts, setOriginalProducts] = useState([]);
  
  // Sort products function - defined before it's used
  const sortProducts = useCallback((productsToSort, sortType) => {
    let sortedProducts = [...productsToSort];
    
    switch (sortType) {
      case 'a-z':
        sortedProducts.sort((a, b) => a.Name.localeCompare(b.Name));
        break;
      case 'z-a':
        sortedProducts.sort((a, b) => b.Name.localeCompare(a.Name));
        break;
      case 'low-high':
        sortedProducts.sort((a, b) => parseFloat(a.Price) - parseFloat(b.Price));
        break;
      case 'high-low':
        sortedProducts.sort((a, b) => parseFloat(b.Price) - parseFloat(a.Price));
        break;
      case 'default':
        if (selectedCategory === 'all') {
          sortedProducts = [...originalProducts];
        } else {
          sortedProducts = originalProducts.filter(product => product.Category === selectedCategory);
        }
        break;
      default:
        break;
    }
    
    setFilteredProducts(sortedProducts);
  }, [selectedCategory, originalProducts]);
  
  // Load products from CSV
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(productData);
        const csvData = await response.text();
        
        Papa.parse(csvData, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log('CSV parsing complete:', results);
            const productList = results.data;
            // Filter out any empty rows
            const validProducts = productList.filter(product => product.ProductID);
            setProducts(validProducts);
            setFilteredProducts(validProducts);
            setOriginalProducts(validProducts); // Store original order
            
            // Extract unique categories
            const uniqueCategories = ['all', ...new Set(validProducts.map(product => product.Category))];
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
  
  // Filter products when category changes and apply sorting
  useEffect(() => {
    let filtered = [];
    
    if (selectedCategory === 'all') {
      filtered = [...products];
    } else {
      filtered = products.filter(product => product.Category === selectedCategory);
    }
    
    // Apply sorting
    sortProducts(filtered, sortBy);
  }, [selectedCategory, products, sortBy, sortProducts]);
  
  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // Reset sort to default when changing categories
    setSortBy('default');
  };
  
  // Handle sort change
  const handleSortChange = (sortType) => {
    setSortBy(sortType);
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
      
      <div className="sort-container">
        <label htmlFor="sort-select">Sort by:</label>
        <select 
          id="sort-select" 
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="sort-select"
        >
          <option value="default">Default</option>
          <option value="a-z">Name (A to Z)</option>
          <option value="z-a">Name (Z to A)</option>
          <option value="low-high">Price (Low to High)</option>
          <option value="high-low">Price (High to Low)</option>
        </select>
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