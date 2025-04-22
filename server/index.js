require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.listen(process.env.PORT, () => 
  console.log(`Server running on port ${process.env.PORT}`));
