import express from "express";
import {
  imageMessageController,
  textMessageController,
} from "../controllers/message.controller.js";
import protect from "../middleware/auth.js";

const messageRouter = express.Router();

messageRouter.post("/text", protect, textMessageController);
messageRouter.post("/image", protect, imageMessageController);

export default messageRouter;
