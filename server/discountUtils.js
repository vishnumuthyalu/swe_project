const fs = require('fs');
const path = require('path');

// Path to the CSV file from the project root
const csvFilePath = path.resolve(__dirname, '..', 'src', 'assets', 'discount_codes.csv');

/**
 * Read all discount codes from the CSV file
 * @returns {Array} Array of discount code objects
 */
function readDiscountCodes() {
  try {
    console.log('Reading discount codes from CSV...');
    console.log('CSV file path:', csvFilePath);
    
    // Check if file exists, if not create it with headers
    if (!fs.existsSync(csvFilePath)) {
      console.log('Discount codes CSV does not exist, creating file with headers...');
      fs.writeFileSync(csvFilePath, 'id,code,discount,isActive\n', 'utf8');
      return [];
    }
    
    // Check file permissions
    try {
      fs.accessSync(csvFilePath, fs.constants.R_OK | fs.constants.W_OK);
      console.log('File is readable and writable');
    } catch (err) {
      console.error('File permission error:', err);
      // Try to fix permissions
      try {
        fs.chmodSync(csvFilePath, 0o666);
        console.log('Fixed file permissions');
      } catch (chmodErr) {
        console.error('Failed to fix file permissions:', chmodErr);
      }
    }
    
    const fileContent = fs.readFileSync(csvFilePath, 'utf8');
    console.log('File content length:', fileContent.length);
    
    // If file is empty or only has headers, return empty array
    if (fileContent.trim().split('\n').length <= 1) {
      console.log('File is empty or only has headers');
      return [];
    }
    
    const lines = fileContent.trim().split('\n');
    console.log(`File has ${lines.length} lines`);
    const headers = lines[0].split(',');
    console.log('Headers:', headers);
    
    const discountCodes = [];
    
    // Parse each line (skipping the header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        console.log(`Line ${i} is empty, skipping`);
        continue;
      }
      
      const values = line.split(',');
      console.log(`Line ${i} values:`, values);
      
      // Create object with header keys
      const discountCode = {};
      headers.forEach((header, index) => {
        // Convert certain fields to appropriate types
        if (header === 'discount') {
          discountCode[header] = parseInt(values[index], 10);
        } else if (header === 'isActive') {
          discountCode[header] = values[index].toLowerCase() === 'true';
        } else {
          discountCode[header] = values[index];
        }
      });
      
      console.log(`Parsed discount code:`, discountCode);
      discountCodes.push(discountCode);
    }
    
    console.log(`Read ${discountCodes.length} discount codes from CSV`);
    return discountCodes;
  } catch (error) {
    console.error('Error reading discount codes from CSV:', error);
    return [];
  }
}

/**
 * Write discount codes to the CSV file
 * @param {Array} discountCodes Array of discount code objects
 * @returns {Boolean} Success status
 */
function writeDiscountCodes(discountCodes) {
  try {
    console.log('Writing discount codes to CSV...');
    console.log('Discount codes to write:', discountCodes);
    
    // Create a backup of the current file
    if (fs.existsSync(csvFilePath)) {
      const backupPath = `${csvFilePath}.backup`;
      console.log(`Creating backup at ${backupPath}`);
      fs.copyFileSync(csvFilePath, backupPath);
    }
    
    // Create CSV content
    let csvContent = 'id,code,discount,isActive\n';
    
    // Add each discount code as a row
    discountCodes.forEach(code => {
      csvContent += `${code.id},${code.code},${code.discount},${code.isActive}\n`;
    });
    
    console.log('CSV content to write:', csvContent);
    
    // Write to file using a temporary file to prevent corruption
    const tempFilePath = `${csvFilePath}.temp`;
    fs.writeFileSync(tempFilePath, csvContent, 'utf8');
    
    // Rename the temp file to the actual file (atomic operation)
    fs.renameSync(tempFilePath, csvFilePath);
    
    console.log(`Successfully wrote ${discountCodes.length} discount codes to CSV`);
    
    return true;
  } catch (error) {
    console.error('Error writing discount codes to CSV:', error);
    // Try to restore from backup if available
    try {
      const backupPath = `${csvFilePath}.backup`;
      if (fs.existsSync(backupPath)) {
        console.log('Restoring from backup');
        fs.copyFileSync(backupPath, csvFilePath);
      }
    } catch (backupError) {
      console.error('Error restoring from backup:', backupError);
    }
    return false;
  }
}

/**
 * Add a new discount code
 * @param {Object} newCode New discount code object
 * @returns {Boolean} Success status
 */
function addDiscountCode(newCode) {
  try {
    console.log('Adding new discount code:', newCode);
    
    // Read existing codes
    const discountCodes = readDiscountCodes();
    
    // Check if code already exists
    const existingCode = discountCodes.find(code => 
      code.code.toLowerCase() === newCode.code.toLowerCase());
    
    if (existingCode) {
      console.error('Discount code already exists:', newCode.code);
      return false;
    }
    
    // Add new code
    discountCodes.push(newCode);
    
    // Write back to file
    return writeDiscountCodes(discountCodes);
  } catch (error) {
    console.error('Error adding discount code:', error);
    return false;
  }
}

/**
 * Update a discount code
 * @param {String} id ID of the discount code to update
 * @param {Object} updatedCode Updated discount code data
 * @returns {Boolean} Success status
 */
function updateDiscountCode(id, updatedCode) {
  try {
    console.log(`Updating discount code ${id}:`, updatedCode);
    
    // Read existing codes
    const discountCodes = readDiscountCodes();
    
    // Find index of code to update
    const index = discountCodes.findIndex(code => code.id === id);
    
    if (index === -1) {
      console.error('Discount code not found:', id);
      return false;
    }
    
    // Update code
    discountCodes[index] = { ...discountCodes[index], ...updatedCode };
    
    // Write back to file
    return writeDiscountCodes(discountCodes);
  } catch (error) {
    console.error('Error updating discount code:', error);
    return false;
  }
}

/**
 * Delete a discount code
 * @param {String} id ID of the discount code to delete
 * @returns {Boolean} Success status
 */
function deleteDiscountCode(id) {
  try {
    console.log(`Deleting discount code ${id}`);
    
    // Read existing codes
    const discountCodes = readDiscountCodes();
    
    // Filter out the code to delete
    const updatedCodes = discountCodes.filter(code => code.id !== id);
    
    if (updatedCodes.length === discountCodes.length) {
      console.error('Discount code not found:', id);
      return false;
    }
    
    // Write back to file
    return writeDiscountCodes(updatedCodes);
  } catch (error) {
    console.error('Error deleting discount code:', error);
    return false;
  }
}

/**
 * Toggle the active status of a discount code
 * @param {String} id ID of the discount code to toggle
 * @returns {Boolean} Success status
 */
function toggleDiscountCodeStatus(id) {
  try {
    console.log(`Toggling status for discount code ${id}`);
    
    // Read existing codes
    const discountCodes = readDiscountCodes();
    
    // Find index of code to update
    const index = discountCodes.findIndex(code => code.id === id);
    
    if (index === -1) {
      console.error('Discount code not found:', id);
      return false;
    }
    
    // Toggle isActive
    discountCodes[index].isActive = !discountCodes[index].isActive;
    
    // Write back to file
    return writeDiscountCodes(discountCodes);
  } catch (error) {
    console.error('Error toggling discount code status:', error);
    return false;
  }
}

/**
 * Find a discount code by code string
 * @param {String} codeString The discount code to find
 * @returns {Object|null} The discount code object or null if not found
 */
function findDiscountCode(codeString) {
  try {
    console.log(`Finding discount code ${codeString}`);
    
    // Read all discount codes
    const discountCodes = readDiscountCodes();
    
    // Find the code that matches and is active
    const discountCode = discountCodes.find(code => 
      code.code.toLowerCase() === codeString.toLowerCase() && code.isActive);
    
    console.log(`Found discount code:`, discountCode || 'Not found');
    return discountCode || null;
  } catch (error) {
    console.error('Error finding discount code:', error);
    return null;
  }
}

// Initialize the CSV file if it doesn't exist or if it's empty
function initializeCsvFile() {
  try {
    console.log('Initializing discount codes CSV file...');
    
    // Default discount codes
    const defaultCodes = [
      { id: '1', code: 'FREE5', discount: 5, isActive: true },
      { id: '2', code: 'FREE25', discount: 25, isActive: true },
      { id: '3', code: 'FREE50', discount: 50, isActive: true },
      { id: '4', code: 'FREE75', discount: 75, isActive: true },
      { id: '5', code: 'FREE100', discount: 100, isActive: true }
    ];
    
    // Check if file exists and is not empty
    if (!fs.existsSync(csvFilePath)) {
      console.log('CSV file does not exist, creating with default codes...');
      writeDiscountCodes(defaultCodes);
      return;
    }
    
    // Check if file is empty or only has headers
    const fileContent = fs.readFileSync(csvFilePath, 'utf8');
    if (fileContent.trim().split('\n').length <= 1) {
      console.log('CSV file is empty, initializing with default codes...');
      writeDiscountCodes(defaultCodes);
    }
  } catch (error) {
    console.error('Error initializing CSV file:', error);
  }
}

// Initialize CSV file on module load
initializeCsvFile();

module.exports = {
  readDiscountCodes,
  writeDiscountCodes,
  addDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
  toggleDiscountCodeStatus,
  findDiscountCode,
  initializeCsvFile
};