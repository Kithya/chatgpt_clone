import express from "express";
import {
  getPlans,
  purchasePlan,
  verifyPayment,
} from "../controllers/credit.controller.js";
import protect from "../middleware/auth.js";

const creditRouter = express.Router();

creditRouter.get("/plan", getPlans);
creditRouter.post("/purchase", protect, purchasePlan);
creditRouter.post("/verify", protect, verifyPayment);

export default creditRouter;
