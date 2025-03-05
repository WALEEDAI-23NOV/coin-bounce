const mongoose = require("mongoose");

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    content: { type: String, required: true },
    blog: { type: mongoose.Schema.ObjectId, ref: "blogs" },
    author: { type: String, ref: "users" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema, "comments");
