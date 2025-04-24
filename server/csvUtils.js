const fs = require('fs');
const path = require('path');
const { parse, stringify } = require('csv-parse/sync');

// Path to the CSV file from the project root
const csvFilePath = path.resolve(__dirname, '..', 'src', 'assets', 'product_list.csv');
console.log('CSV file path:', csvFilePath);

// Check if the file exists
if (!fs.existsSync(csvFilePath)) {
  console.error('CSV file not found at path:', csvFilePath);
}

/**
 * Read the product list CSV file
 * @returns {Array} Array of product objects
 */
function readProductCSV() {
  try {
    console.log('Reading CSV file...');
    const fileContent = fs.readFileSync(csvFilePath, 'utf8');
    console.log('CSV file content (first 200 chars):', fileContent.substring(0, 200));
    
    const products = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    console.log(`Parsed ${products.length} products from CSV`);
    console.log('Sample product:', JSON.stringify(products[0], null, 2));
    
    return products;
  } catch (error) {
    console.error('Error reading CSV file:', error);
    throw error;
  }
}

/**
 * Write updated products to the CSV file
 * @param {Array} products Array of product objects
 */
function writeProductCSV(products) {
  try {
    console.log('Writing to CSV file using direct method...');
    
    // Read the current CSV file
    const fileContent = fs.readFileSync(csvFilePath, 'utf8');
    const lines = fileContent.split('\n');
    const headerLine = lines[0];
    console.log('Header line:', headerLine);
    
    // Create a map of product ID to updated product
    const productMap = {};
    products.forEach(product => {
      productMap[product.ProductID] = product;
    });
    
    // Update the lines with new product data
    const updatedLines = [headerLine];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const columns = lines[i].split(',');
      const productId = columns[0];
      
      if (productMap[productId]) {
        // This is a product we want to update
        const updatedProduct = productMap[productId];
        columns[5] = updatedProduct.Quantity; // Update the quantity (index 5)
        updatedLines.push(columns.join(','));
      } else {
        // Keep the original line
        updatedLines.push(lines[i]);
      }
    }
    
    // Join lines with newlines and write to file
    const updatedContent = updatedLines.join('\n');
    console.log('Writing CSV content (first 200 chars):', updatedContent.substring(0, 200));
    
    fs.writeFileSync(csvFilePath, updatedContent, 'utf8');
    console.log('Successfully wrote CSV file using direct method');
    
    return true;
  } catch (error) {
    console.error('Error writing CSV file:', error);
    throw error;
  }
}

/**
 * Update product quantities after a successful checkout
 * @param {Array} purchasedItems Array of items purchased with productId and quantity
 * @returns {Boolean} Success status
 */
function updateProductQuantities(purchasedItems) {
  try {
    console.log('Updating product quantities with CSV-aware parsing...');
    console.log('Purchased items:', JSON.stringify(purchasedItems, null, 2));
    
    // Read the file content
    const fileContent = fs.readFileSync(csvFilePath, 'utf8');
    
    // Read the file line by line
    const lines = fileContent.split('\n');
    console.log(`CSV file has ${lines.length} lines`);
    
    // Get the header to identify columns
    const header = lines[0].split(',');
    console.log(`CSV header: ${header.join(', ')}`);
    
    // Find the index of the Quantity column
    const quantityIndex = header.indexOf('Quantity');
    if (quantityIndex === -1) {
      console.error('Could not find Quantity column in the CSV header');
      return false;
    }
    console.log(`Quantity column is at index ${quantityIndex}`);
    
    // Create a map of product IDs to be updated
    const productUpdates = {};
    purchasedItems.forEach(item => {
      productUpdates[item.productId.toString()] = parseInt(item.quantity, 10);
    });
    
    // Track which products were updated
    const updatedProducts = [];
    let updatedLines = [];
    
    // Keep the header unchanged
    updatedLines.push(lines[0]);
    
    // Process each data line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) {
        updatedLines.push(line);
        continue;
      }
      
      // Process the line properly handling quoted fields
      let inQuotes = false;
      let currentField = '';
      let fields = [];
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"' && (j === 0 || line[j-1] !== '\\')) {
          inQuotes = !inQuotes;
          currentField += char;
        } else if (char === ',' && !inQuotes) {
          fields.push(currentField);
          currentField = '';
        } else {
          currentField += char;
        }
      }
      fields.push(currentField); // Add the last field
      
      // Check if this is a product we want to update
      const productId = fields[0];
      if (productUpdates.hasOwnProperty(productId)) {
        console.log(`Found product ${productId} at line ${i+1}`);
        
        // Get current quantity as a number
        const currentQuantity = parseInt(fields[quantityIndex], 10) || 0;
        const purchasedQuantity = productUpdates[productId];
        
        console.log(`Current quantity: ${currentQuantity}, Purchased: ${purchasedQuantity}`);
        
        // Calculate new quantity, don't allow negative values
        const newQuantity = Math.max(0, currentQuantity - purchasedQuantity);
        fields[quantityIndex] = newQuantity.toString();
        
        console.log(`New quantity: ${newQuantity}`);
        updatedProducts.push({
          id: productId,
          name: fields[2],
          oldQuantity: currentQuantity,
          newQuantity: newQuantity
        });
        
        // Join fields back with commas
        updatedLines.push(fields.join(','));
      } else {
        // Keep the line unchanged
        updatedLines.push(line);
      }
    }
    
    if (updatedProducts.length > 0) {
      console.log('Products updated:', JSON.stringify(updatedProducts, null, 2));
      
      // Write the updated content back to the CSV file
      const updatedContent = updatedLines.join('\n');
      fs.writeFileSync(csvFilePath, updatedContent, 'utf8');
      console.log('CSV file updated successfully');
      
      return true;
    } else {
      console.log('No products were updated');
      return false;
    }
  } catch (error) {
    console.error('Error updating product quantities:', error);
    return false;
  }
}

module.exports = {
  readProductCSV,
  writeProductCSV,
  updateProductQuantities
};
