
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PRICES = {
  basic: 'price_basic_monthly_id',
  premium: 'price_premium_monthly_id',
  lifetime: 'price_lifetime_onetime_id'
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { priceKey, userId, email } = req.body; 
  // priceKey: 'basic', 'premium', or 'lifetime'

  if (!PRICES[priceKey]) {
    return res.status(400).json({ error: 'Invalid price key' });
  }

  try {
    const isLifetime = priceKey === 'lifetime';
    
    // Base configuration for the session
    const sessionConfig = {
      customer_email: email,
      metadata: {
        userId: userId,
        targetTier: priceKey
      },
      line_items: [
        {
          price: PRICES[priceKey],
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/#/profile?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/#/shop`,
    };

    if (isLifetime) {
      // One-time payment mode for Lifetime access
      sessionConfig.mode = 'payment';
    } else {
      // Subscription mode with 7-day Trial for Basic/Premium
      sessionConfig.mode = 'subscription';
      sessionConfig.subscription_data = {
        trial_period_days: 7,
        metadata: {
            userId: userId
        }
      };
      // Optional: setup payment behavior to allow "no card upfront" if configured in Stripe,
      // but usually for trials we want 'default_incomplete' to enforce card setup.
      sessionConfig.payment_method_collection = 'if_required';
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ error: error.message });
  }
};
