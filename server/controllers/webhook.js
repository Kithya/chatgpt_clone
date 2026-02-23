import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

const markTransactionPaidAndCreditUser = async (transactionId) => {
  const transaction = await Transaction.findOneAndUpdate(
    { _id: transactionId, isPaid: false },
    { $set: { isPaid: true } },
    { new: true },
  );

  if (!transaction) return;

  await User.updateOne(
    { _id: transaction.userId },
    { $inc: { credits: transaction.credits } },
  );
};

export const stripeWebhooks = async (request, response) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = request.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        const { transactionId, appId } = session.metadata || {};
        if (
          appId === "ChatGPT_clone" &&
          transactionId &&
          session.payment_status === "paid"
        ) {
          await markTransactionPaidAndCreditUser(transactionId);
        }
        break;
      }

      // Fallback for older event flows
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const sessionList = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1,
        });

        const session = sessionList.data[0];
        if (!session) break;

        const { transactionId, appId } = session.metadata || {};
        if (appId === "ChatGPT_clone" && transactionId) {
          await markTransactionPaidAndCreditUser(transactionId);
        }
        break;
      }

      default:
        break;
    }

    return response.json({ received: true });
  } catch (error) {
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }
};
