require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const { updateProductQuantities } = require('./csvUtils');

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

app.listen(process.env.PORT, () => 
  console.log(`Server running on port ${process.env.PORT}`));
