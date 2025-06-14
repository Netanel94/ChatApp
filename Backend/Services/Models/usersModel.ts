import mongoose from "mongoose";

const userScehma = new mongoose.Schema(
  {
    username: String,
    password: String,
    BlockedList: [String],
  },
  { collection: "Users" }
);

const userModel = mongoose.model("user", userScehma);

export default userModel;
