import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Stripe from "stripe";

const plans = [
  {
    _id: "basic",
    name: "Basic",
    price: 10,
    credits: 100,
    features: [
      "100 text generations",
      "50 image generations",
      "Standard support",
      "Access to basic models",
    ],
  },
  {
    _id: "pro",
    name: "Pro",
    price: 20,
    credits: 500,
    features: [
      "500 text generations",
      "200 image generations",
      "Priority support",
      "Access to pro models",
      "Faster response time",
    ],
  },
  {
    _id: "premium",
    name: "Premium",
    price: 30,
    credits: 1000,
    features: [
      "1000 text generations",
      "500 image generations",
      "24/7 VIP support",
      "Access to premium models",
      "Dedicated account manager",
    ],
  },
];

// API controller for getting all plans
export const getPlans = async (req, res) => {
  try {
    return res.json({ success: true, plans });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// create stripe instance
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// API controller for purchasing a plan
export const purchasePlan = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user._id;
    const plan = plans.find((plan) => plan._id === planId);

    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    const transaction = await Transaction.create({
      userId,
      planId: plan._id,
      amount: plan.price,
      credits: plan.credits,
      isPaid: false,
    });

    const { origin } = req.headers;
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: plan.name,
            },
            unit_amount: plan.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/loading?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}`,
      metadata: {
        transactionId: transaction._id.toString(),
        appId: "ChatGPT_clone",
      },
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// API controller for verifying Stripe checkout session after redirect
export const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user._id;

    if (!sessionId) {
      return res
        .status(400)
        .json({ success: false, message: "sessionId is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Checkout session not found" });
    }

    if (session.payment_status !== "paid") {
      return res.json({
        success: false,
        message: "Payment not completed yet",
      });
    }

    const { transactionId, appId } = session.metadata || {};
    if (appId !== "ChatGPT_clone" || !transactionId) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment metadata",
      });
    }

    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId,
    });

    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    if (transaction.isPaid) {
      return res.json({
        success: true,
        message: "Payment already verified",
      });
    }

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, userId, isPaid: false },
      { $set: { isPaid: true } },
      { new: true },
    );

    if (updatedTransaction) {
      await User.updateOne(
        { _id: userId },
        { $inc: { credits: updatedTransaction.credits } },
      );
    }

    return res.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
