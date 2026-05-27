const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only favorite a post once
favoriteSchema.index({ user: 1, post: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema)
