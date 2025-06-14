import mongoose from "mongoose";

const conversetionSchema = new mongoose.Schema(
  {
    users: { type: Array },
    conversation: [{ senderId: String, message: String, createdAt: Date }],
  },
  { collection: "Conversetions", timestamps: true }
);

const conversetionModel = mongoose.model("conversetions", conversetionSchema);

export default conversetionModel;
