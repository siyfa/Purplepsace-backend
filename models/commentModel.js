import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    user: {
      id: {
        type: ObjectId,
      },
      username: {
        type: String,
      },
      profilePicture: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Comment", commentSchema);
