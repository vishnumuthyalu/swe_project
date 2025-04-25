const fs = require('fs');
const path = require('path');

// Path to the CSV file from the project root
const csvFilePath = path.resolve(__dirname, '..', 'src', 'assets', 'product_list.csv');

/**
 * Update a product in the CSV file
 * @param {string} productId - The ID of the product to update
 * @param {Object} updatedProduct - The updated product data
 * @returns {Boolean} Success status
 */
function updateProduct(productId, updatedProduct) {
  try {
    console.log('Updating product with CSV-aware parsing...');
    console.log('Product ID:', productId);
    console.log('Updated product data:', JSON.stringify(updatedProduct, null, 2));
    
    // Read the file content
    const fileContent = fs.readFileSync(csvFilePath, 'utf8');
    
    // Read the file line by line
    const lines = fileContent.split('\\n');
    console.log(`CSV file has ${lines.length} lines`);
    
    // Get the header to identify columns
    const header = lines[0].split(',');
    console.log(`CSV header: ${header.join(', ')}`);
    
    // Find the indexes of the columns we need to update
    const columnIndexes = {
      Category: header.indexOf('Category'),
      Name: header.indexOf('Name'),
      Price: header.indexOf('Price'),
      Description: header.indexOf('Description'),
      Quantity: header.indexOf('Quantity'),
      ImageURL: header.indexOf('ImageURL')
    };
    
    // Verify all column indexes were found
    for (const [column, index] of Object.entries(columnIndexes)) {
      if (index === -1) {
        console.error(`Could not find ${column} column in the CSV header`);
        return false;
      }
    }
    
    // Track if the product was found and updated
    let productUpdated = false;
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
        
        if (char === '"' && (j === 0 || line[j-1] !== '\\\\')) {
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
      
      // Check if this is the product we want to update
      if (fields[0] === productId.toString()) {
        console.log(`Found product ${productId} at line ${i+1}`);
        
        // Update the fields with new values
        fields[columnIndexes.Category] = updatedProduct.Category;
        fields[columnIndexes.Name] = updatedProduct.Name;
        fields[columnIndexes.Price] = updatedProduct.Price;
        
        // Handle description with proper quoting
        let description = updatedProduct.Description;
        if (!description.startsWith('"')) {
          description = `"${description.replace(/"/g, '""')}"`;
        }
        fields[columnIndexes.Description] = description;
        
        fields[columnIndexes.Quantity] = updatedProduct.Quantity;
        fields[columnIndexes.ImageURL] = updatedProduct.ImageURL;
        
        productUpdated = true;
        updatedLines.push(fields.join(','));
      } else {
        // Keep the line unchanged
        updatedLines.push(line);
      }
    }
    
    if (productUpdated) {
      console.log('Product updated successfully');
      
      // Write the updated content back to the CSV file
      const updatedContent = updatedLines.join('\\n');
      fs.writeFileSync(csvFilePath, updatedContent, 'utf8');
      console.log('CSV file updated successfully');
      
      return true;
    } else {
      console.log(`Product ${productId} not found in the CSV file`);
      return false;
    }
  } catch (error) {
    console.error('Error updating product:', error);
    return false;
  }
}

/**
 * Add a new product to the CSV file
 * @param {Object} newProduct - The new product data
 * @returns {Boolean} Success status
 */
function addProduct(newProduct) {
  try {
    console.log('Adding new product with CSV-aware parsing...');
    console.log('New product data:', JSON.stringify(newProduct, null, 2));
    
    // Read the file content
    const fileContent = fs.readFileSync(csvFilePath, 'utf8');
    
    // Read the file line by line
    const lines = fileContent.split('\\n');
    
    // Format the new product line
    const newProductLine = [
      newProduct.ProductID,
      newProduct.Category,
      newProduct.Name,
      newProduct.Price,
      `"${newProduct.Description.replace(/"/g, '""')}"`,
      newProduct.Quantity,
      newProduct.ImageURL
    ].join(',');
    
    // Add the new product to the lines
    lines.push(newProductLine);
    
    // Write the updated content back to the CSV file
    const updatedContent = lines.join('\\n');
    fs.writeFileSync(csvFilePath, updatedContent, 'utf8');
    console.log('CSV file updated successfully with new product');
    
    return true;
  } catch (error) {
    console.error('Error adding new product:', error);
    return false;
  }
}

module.exports = {
  updateProduct,
  addProduct
};
