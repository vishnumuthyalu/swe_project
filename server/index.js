require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const { updateProductQuantities } = require('./csvUtils');
const { updateProduct, addProduct } = require('./productUtils');
const { readDiscountCodes, addDiscountCode, toggleDiscountCodeStatus, deleteDiscountCode, findDiscountCode } = require('./discountUtils');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add a test endpoint to manually update quantity
app.post('/test-update-quantity', async (req, res) => {
  try {
    const { productId, newQuantity } = req.body;
    
    if (!productId || newQuantity === undefined) {
      return res.status(400).json({ error: 'Product ID and new quantity are required' });
    }
    
    console.log(`Test updating product ${productId} to quantity ${newQuantity}`);
    
    // Read the CSV file
    const fileContent = fs.readFileSync(csvFilePath, 'utf8');
    const lines = fileContent.split('\n');
    const headerLine = lines[0];
    
    // Find the product line
    let productFound = false;
    const updatedLines = lines.map(line => {
      const columns = line.split(',');
      if (columns[0] === productId.toString()) {
        productFound = true;
        // The quantity is at index 5 (0-based)
        columns[5] = newQuantity.toString();
        return columns.join(',');
      }
      return line;
    });
    
    if (!productFound) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Write back to the file
    const updatedContent = updatedLines.join('\n');
    fs.writeFileSync(csvFilePath, updatedContent, 'utf8');
    
    return res.json({ success: true, message: 'Product quantity updated successfully' });
  } catch (error) {
    console.error('Error in test update:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to update a product
app.post('/update-product', async (req, res) => {
  try {
    console.log('Received update product request:', req.body);
    const { productId, updatedProduct } = req.body;
    
    if (!productId || !updatedProduct) {
      console.error('Invalid request data', req.body);
      return res.status(400).json({ error: 'Product ID and updated product data are required' });
    }
    
    const updateSuccess = updateProduct(productId, updatedProduct);
    
    if (updateSuccess) {
      console.log('Successfully updated product');
      res.json({ success: true, message: 'Product updated successfully' });
    } else {
      console.error('Failed to update product');
      res.status(500).json({ success: false, message: 'Failed to update product' });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to add a new product
app.post('/add-product', async (req, res) => {
  try {
    console.log('Received add product request:', req.body);
    const { newProduct } = req.body;
    
    if (!newProduct) {
      console.error('Invalid request data', req.body);
      return res.status(400).json({ error: 'New product data is required' });
    }
    
    const addSuccess = addProduct(newProduct);
    
    if (addSuccess) {
      console.log('Successfully added new product');
      res.json({ success: true, message: 'Product added successfully' });
    } else {
      console.error('Failed to add product');
      res.status(500).json({ success: false, message: 'Failed to add product' });
    }
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test file access and permissions
const fs = require('fs');
const path = require('path');
const csvFilePath = path.resolve(__dirname, '..', 'src', 'assets', 'product_list.csv');

console.log('Testing file permissions...');
try {
  // Check if the file exists and is readable
  const fileStats = fs.statSync(csvFilePath);
  console.log('CSV file exists, size:', fileStats.size);
  
  // Try to read the file
  const fileContent = fs.readFileSync(csvFilePath, 'utf8');
  console.log('Successfully read CSV file, first 100 chars:', fileContent.substring(0, 100));
  
  // Try to write to a test file in the same directory
  const testWritePath = path.join(path.dirname(csvFilePath), 'test_write.txt');
  fs.writeFileSync(testWritePath, 'Test write: ' + new Date().toString(), 'utf8');
  console.log('Successfully wrote test file at:', testWritePath);
  
  // Clean up the test file
  fs.unlinkSync(testWritePath);
  console.log('Successfully removed test file');
} catch (error) {
  console.error('Error testing file permissions:', error);
}

//TEST endpoint
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items, taxRate, discountRate } = req.body;
    
    if (!items || !Array.isArray(items)) {
      throw new Error('Invalid items array');
    }
    if (typeof taxRate !== 'number' || taxRate < 0) {
      throw new Error('Invalid tax rate');
    }
    if (typeof discountRate !== 'number' || discountRate < 0 || discountRate > 1) {
      throw new Error('Invalid discount rate');
    }

    // Calculate subtotal with discounts
    const lineItems = items.map(item => {
      const discountedPrice = item.price * (1 - discountRate);
      return {
        price_data: {
          currency: 'usd',
          product_data: { name: item.name },
          unit_amount: Math.round(discountedPrice * 100),
        },
        quantity: item.quantity,
      };
    });

    // Calculate tax as separate line item
    const subtotal = items.reduce((sum, item) => 
      sum + (item.price * (1 - discountRate) * item.quantity), 0);
    const taxAmount = subtotal * taxRate;

    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Sales Tax' },
        unit_amount: Math.round(taxAmount * 100),
      },
      quantity: 1,
    });

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    res.json({ id: session.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.post('/testPost', (req, res) => {
    console.log('Endpoint reached!'); // Test if this logs
    res.sendStatus(200);
  });

// Endpoint to get all discount codes
app.get('/discount-codes', async (req, res) => {
  try {
    console.log('Get discount codes request received');
    // Initialize CSV file if needed
    require('./discountUtils').initializeCsvFile();
    
    const discountCodes = readDiscountCodes();
    console.log('Returning discount codes:', discountCodes);
    res.json({ success: true, discountCodes });
  } catch (error) {
    console.error('Error getting discount codes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to add a new discount code
app.post('/discount-codes', async (req, res) => {
  try {
    console.log('Add discount code request received:', req.body);
    const { code, discount } = req.body;
    
    if (!code || !discount) {
      console.error('Invalid request: missing code or discount', req.body);
      return res.status(400).json({ 
        success: false, 
        error: 'Code and discount percentage are required' 
      });
    }
    
    // Create a new discount code object
    const newDiscountCode = {
      id: Date.now().toString(),
      code: code.toUpperCase(),
      discount: parseInt(discount, 10),
      isActive: true
    };
    
    console.log('Adding new discount code:', newDiscountCode);
    const success = addDiscountCode(newDiscountCode);
    
    if (success) {
      console.log('Successfully added discount code');
      const allCodes = readDiscountCodes();
      console.log('Returning all codes:', allCodes.length);
      return res.json({ success: true, discountCodes: allCodes });
    } else {
      console.error('Failed to add discount code');
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to add discount code' 
      });
    }
  } catch (error) {
    console.error('Error adding discount code:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to toggle discount code status
app.patch('/discount-codes/:id', async (req, res) => {
  try {
    console.log(`Toggle discount code status request received for ID: ${req.params.id}`);
    const { id } = req.params;
    
    const success = toggleDiscountCodeStatus(id);
    
    if (success) {
      console.log('Successfully toggled discount code status');
      const allCodes = readDiscountCodes();
      console.log('Returning updated discount codes');
      return res.json({ success: true, discountCodes: allCodes });
    } else {
      console.error('Failed to toggle discount code status');
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to toggle discount code status' 
      });
    }
  } catch (error) {
    console.error('Error toggling discount code status:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to delete a discount code
app.delete('/discount-codes/:id', async (req, res) => {
  try {
    console.log(`Delete discount code request received for ID: ${req.params.id}`);
    const { id } = req.params;
    
    const success = deleteDiscountCode(id);
    
    if (success) {
      console.log('Successfully deleted discount code');
      const allCodes = readDiscountCodes();
      console.log('Returning updated discount codes');
      return res.json({ success: true, discountCodes: allCodes });
    } else {
      console.error('Failed to delete discount code');
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to delete discount code' 
      });
    }
  } catch (error) {
    console.error('Error deleting discount code:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to verify a discount code
app.post('/verify-discount', async (req, res) => {
  try {
    console.log('Verify discount code request received:', req.body);
    const { code } = req.body;
    
    if (!code) {
      console.error('Invalid request: missing discount code');
      return res.status(400).json({ 
        success: false, 
        error: 'Discount code is required' 
      });
    }
    
    const discountCode = findDiscountCode(code);
    
    if (discountCode) {
      console.log(`Valid discount code found: ${discountCode.code}, ${discountCode.discount}%`);
      return res.json({ 
        success: true, 
        valid: true, 
        discount: discountCode.discount 
      });
    } else {
      console.log(`Invalid discount code: ${code}`);
      return res.json({ 
        success: true, 
        valid: false, 
        discount: 0 
      });
    }
  } catch (error) {
    console.error('Error verifying discount code:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to update product quantities after successful checkout
app.post('/update-quantities', async (req, res) => {
  try {
    console.log('Received update quantities request:', req.body);
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      console.error('Invalid items array', items);
      return res.status(400).json({ error: 'Invalid items array' });
    }
    
    console.log(`Processing ${items.length} items for quantity update`);
    
    const purchasedItems = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));
    
    const updateSuccess = updateProductQuantities(purchasedItems);
    
    if (updateSuccess) {
      console.log('Successfully updated product quantities');
      res.json({ success: true, message: 'Product quantities updated successfully' });
    } else {
      console.error('Failed to update product quantities');
      res.status(500).json({ success: false, message: 'Failed to update product quantities' });
    }
  } catch (error) {
    console.error('Error updating quantities:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to get all sale items
app.get('/sale-items', async (req, res) => {
  try {
    console.log('Get sale items request received');
    
    const saleItems = readSaleItems();
    console.log('Returning sale items:', saleItems.length);
    res.json({ success: true, saleItems });
  } catch (error) {
    console.error('Error getting sale items:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to add a new sale item
app.post('/sale-items', async (req, res) => {
  try {
    console.log('Add sale item request received:', req.body);
    const { productId, productName, originalPrice, discountPercent, salePrice, isActive } = req.body;
    
    if (!productId || !originalPrice || !discountPercent || !salePrice) {
      console.error('Invalid request: missing required fields', req.body);
      return res.status(400).json({ 
        success: false, 
        error: 'Product ID, prices, and discount percentage are required' 
      });
    }
    
    // Create a new sale item object
    const newSaleItem = {
      id: Date.now().toString(),
      productId,
      productName,
      originalPrice: parseFloat(originalPrice),
      discountPercent: parseInt(discountPercent, 10),
      salePrice: parseFloat(salePrice).toFixed(2),
      isActive: isActive !== false // Default to true if not specified
    };
    
    console.log('Adding new sale item:', newSaleItem);
    const success = addSaleItem(newSaleItem);
    
    if (success) {
      console.log('Successfully added sale item');
      const allSaleItems = readSaleItems();
      console.log('Returning all sale items:', allSaleItems.length);
      return res.json({ success: true, saleItems: allSaleItems, newSaleItem });
    } else {
      console.error('Failed to add sale item');
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to add sale item' 
      });
    }
  } catch (error) {
    console.error('Error adding sale item:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to toggle sale item status
app.patch('/sale-items/:id', async (req, res) => {
  try {
    console.log(`Toggle sale item status request received for ID: ${req.params.id}`);
    const { id } = req.params;
    const { currentSaleItems } = req.body;
    
    if (!currentSaleItems || !Array.isArray(currentSaleItems)) {
      console.error('Invalid request: missing current sale items');
      return res.status(400).json({ 
        success: false, 
        error: 'Current sale items are required' 
      });
    }
    
    const success = toggleSaleStatus(id, currentSaleItems);
    
    if (success) {
      console.log('Successfully toggled sale item status');
      const updatedSaleItems = readSaleItems();
      console.log('Returning updated sale items');
      return res.json({ success: true, saleItems: updatedSaleItems });
    } else {
      console.error('Failed to toggle sale item status');
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to toggle sale item status' 
      });
    }
  } catch (error) {
    console.error('Error toggling sale item status:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to delete a sale item
app.delete('/sale-items/:id', async (req, res) => {
  try {
    console.log(`Delete sale item request received for ID: ${req.params.id}`);
    const { id } = req.params;
    const { productId } = req.body;
    
    if (!productId) {
      console.error('Invalid request: missing product ID');
      return res.status(400).json({ 
        success: false, 
        error: 'Product ID is required' 
      });
    }
    
    const success = removeSaleItem(productId);
    
    if (success) {
      console.log('Successfully deleted sale item');
      const updatedSaleItems = readSaleItems();
      console.log('Returning updated sale items');
      return res.json({ success: true, saleItems: updatedSaleItems });
    } else {
      console.error('Failed to delete sale item');
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to delete sale item' 
      });
    }
  } catch (error) {
    console.error('Error deleting sale item:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(process.env.PORT, () => 
  console.log(`Server running on port ${process.env.PORT}`));
