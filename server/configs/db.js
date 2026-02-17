import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => console.log("Connected to DB✅"));
    await mongoose.connect(`${process.env.MONGODB_URI}/chatgpt_clone`);
  } catch (error) {
    console.log(error.message);
  }
};

export default connectDB;
