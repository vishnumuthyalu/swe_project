import React, { createContext, useState, useEffect } from 'react';
import Papa from 'papaparse';
import productData from '../assets/product_list.csv';

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all products when the component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(productData);
        const csvData = await response.text();
        
        Papa.parse(csvData, {
          header: true,
          complete: (results) => {
            // Filter out any empty entries
            const products = results.data.filter(product => product.ProductID);
            setAllProducts(products);
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

  // Perform search when searchQuery changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    // Only search if there's an actual keyword (more than one character)
    if (searchQuery.trim().length <= 1) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    
    const results = allProducts.filter(product => {
      const name = product.Name.toLowerCase();
      const description = product.Description.toLowerCase();
      const category = product.Category.toLowerCase();
      
      // Check if the product matches any of the search criteria
      return (
        name.includes(query) || 
        description.includes(query) || 
        category.includes(query)
      );
    });
    
    setSearchResults(results);
  }, [searchQuery, allProducts]);

  // Function to handle search query update
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Clear search results
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        searchResults,
        loading,
        handleSearch,
        clearSearch
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
