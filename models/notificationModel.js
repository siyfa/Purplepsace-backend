import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    type: {
      type: String,
    },
    typeId: {
      type: String,
    },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Notification", notificationSchema);
