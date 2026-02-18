import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/user.route.js";
import chatRouter from "./routes/chat.route.js";

const app = express();

app.use(express.json());
app.use(cors());

await connectDB();

app.get("/", (req, res) => {
  res.send("Hello from the server!");
});

app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
