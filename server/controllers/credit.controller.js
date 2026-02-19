import Transaction from "../models/Transaction";

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

    // create new transaction
    const transaction = await Transaction.create({
        userId: userId,
        planId: plan._id,
        amount: plan.price,
        credits: plan.credits,
        isPaid: false,
    })

     

    return res.json({ success: true, transaction });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
