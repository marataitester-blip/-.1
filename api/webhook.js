
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// import { updateUserInDatabase } from '../utils/db'; // Mock DB function

// This needs to be the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Helper to update DB (Pseudo-code)
  const updateUserSubscription = async (stripeCustomerId, data) => {
    console.log(`[DB Update] Customer ${stripeCustomerId}:`, data);
    // await db.users.update({ stripeCustomerId }, { ...data });
  };

  try {
    switch (event.type) {
      // 1. Handle successful checkout (both Subscription start and Lifetime payment)
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.userId;
        const targetTier = session.metadata.targetTier;

        if (session.mode === 'subscription') {
          // Subscription started (likely in trial)
          await updateUserSubscription(session.customer, {
            userId, // Link Stripe Customer ID to User ID
            'subscription.tier': targetTier,
            'subscription.status': 'trialing', // Usually starts as trialing
          });
        } else if (session.mode === 'payment' && session.payment_status === 'paid') {
          // Lifetime payment successful
          await updateUserSubscription(session.customer, {
             userId,
            'subscription.tier': 'lifetime',
            'subscription.status': 'active',
            'subscription.trialEndsAt': null
          });
        }
        break;
      }

      // 2. Handle Subscription Updates (Trial ending, Renewals, Cancellations)
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        const status = subscription.status; // active, trialing, past_due, canceled
        const trialEnd = subscription.trial_end 
          ? new Date(subscription.trial_end * 1000).toISOString() 
          : null;
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

        await updateUserSubscription(subscription.customer, {
          'subscription.status': status,
          'subscription.trialEndsAt': trialEnd,
          'subscription.currentPeriodEnd': currentPeriodEnd,
          'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end
        });
        break;
      }

      // 3. Handle Subscription Deletion (Expiration or Immediate Cancel)
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await updateUserSubscription(subscription.customer, {
          'subscription.status': 'canceled',
          'subscription.tier': 'free' // Revert to free
        });
        break;
      }

      // 4. Handle Failed Payments (Retries failed)
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        // Notify user via email service here
        console.log(`⚠️ Invoice payment failed for customer ${customerId}`);
        
        // Optionally downgrade immediately or wait for subscription.updated (past_due)
        await updateUserSubscription(customerId, {
            'subscription.status': 'past_due'
        });
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    res.status(500).send('Internal Server Error');
  }
};
