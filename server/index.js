require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Payment endpoint
app.post('/create-checkout-session', async (req, res) => {
  try {
    console.log("BODY RECEIVED:",req.body);
    console.log('Items:', req.body?.items);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: req.body.items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    //DEBUG
    //console.log("BODY RECEIVED:",req.body);
    //console.log('Items:', req.body?.items);

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
