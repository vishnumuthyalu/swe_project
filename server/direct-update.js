const fs = require('fs');
const path = require('path');

// Path to the CSV file
const csvFilePath = path.resolve(__dirname, '..', 'src', 'assets', 'product_list.csv');

// Product ID and new quantity
const productId = "101";
const newQuantity = "90";

console.log('Directly updating CSV file...');
console.log(`File path: ${csvFilePath}`);

try {
  // Read the file
  const fileContent = fs.readFileSync(csvFilePath, 'utf8');
  console.log(`Original file size: ${fileContent.length} bytes`);
  
  // Split into lines
  const lines = fileContent.split('\n');
  console.log(`File has ${lines.length} lines`);
  
  // Process each line
  let updated = false;
  const updatedLines = lines.map(line => {
    // Skip empty lines
    if (!line.trim()) return line;
    
    // Split by comma
    const parts = line.split(',');
    
    // Check if this is the product we want to update
    if (parts[0] === productId) {
      console.log(`Found product ${productId} at line with content: ${line}`);
      console.log(`Current quantity: ${parts[5]}`);
      
      // Update the quantity (6th column, index 5)
      parts[5] = newQuantity;
      updated = true;
      
      // Join back with commas
      const updatedLine = parts.join(',');
      console.log(`Updated line: ${updatedLine}`);
      return updatedLine;
    }
    
    return line;
  });
  
  if (!updated) {
    console.log(`Product ${productId} not found in the CSV file`);
    process.exit(1);
  }
  
  // Join lines and write back to file
  const updatedContent = updatedLines.join('\n');
  
  // Create a backup of the original file
  const backupPath = csvFilePath + '.backup';
  fs.writeFileSync(backupPath, fileContent, 'utf8');
  console.log(`Backup created at: ${backupPath}`);
  
  // Write the updated content
  fs.writeFileSync(csvFilePath, updatedContent, 'utf8');
  console.log(`File updated successfully. New size: ${updatedContent.length} bytes`);
  
  // Verify the update
  const verifyContent = fs.readFileSync(csvFilePath, 'utf8');
  const verifyLines = verifyContent.split('\n');
  let verified = false;
  
  for (const line of verifyLines) {
    if (!line.trim()) continue;
    
    const parts = line.split(',');
    if (parts[0] === productId) {
      console.log(`Verification - Product ${productId} quantity is now: ${parts[5]}`);
      verified = true;
      break;
    }
  }
  
  if (!verified) {
    console.log('Verification failed: Could not find the product after update.');
  }
  
} catch (error) {
  console.error('Error updating CSV file:', error);
}
