import React, { useContext } from 'react';
import { SearchContext } from '../../context/SearchContext';
import ProductCard from '../products/ProductCard';
import '../../styles/SearchResults.css';
import { Link } from 'react-router-dom';

const SearchResults = () => {
  const { searchQuery, searchResults, loading, clearSearch } = useContext(SearchContext);

  if (loading) {
    return (
      <div className="page-container">
        <h1>Search Results</h1>
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  if (searchQuery === '' || searchQuery.length <= 1) {
    return (
      <div className="page-container">
        <h1>Search Results</h1>
        <div className="empty-search">
          <p>Enter a keyword with at least two characters to find products</p>
          <Link to="/products" className="browse-products-link">Browse All Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="search-results-header">
        <h1>Search Results</h1>
        <div className="search-info">
          <p>
            {searchResults.length === 0
              ? `No products found for "${searchQuery}"`
              : `Found ${searchResults.length} product${searchResults.length === 1 ? '' : 's'} for "${searchQuery}"`}
          </p>
          <button onClick={clearSearch} className="clear-search-btn">Clear Search</button>
        </div>
      </div>

      {searchResults.length > 0 ? (
        <div className="search-results-grid">
          {searchResults.map((product) => (
            <div key={product.ProductID} className="search-result-item">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="no-results">
          <p>No products match your search criteria.</p>
          <p>Try a different search term or browse our categories.</p>
          <Link to="/products" className="browse-products-link">Browse All Products</Link>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
