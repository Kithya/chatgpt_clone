import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const stripeWebhooks = async (request, response) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        {
          const paymentIntent = event.data.object;
          // Then define and call a function to handle the event payment_intent.succeeded
          const sessionList = await stripe.checkout.sessions.list({
            payment_intent: paymentIntent.id,
          });

          const session = sessionList[0];
          const { transactionId, appId } = session.metadata;

          if (appId === "ChatGPT_clone") {
            const transaction = await Transaction.findOne({
              _id: transactionId,
              isPaid: false,
            });

            // update credit in user account
            await User.updateOne(
              {
                _id: transaction.userId,
              },
              { $inc: { credits: transaction.credits } },
            );

            // update payment status
            transaction.isPaid = true;
            await transaction.save();
          } else {
            return response.json({
              recieved: true,
              message: "Invalid request",
            });
          }
        }

        break;

      default:
        console.log("Unhandle event type:", event.type);
        break;
    }

    return response.json({ recieved: true });
  } catch (error) {
    console.log(error);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }
};
