const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },

    description: {
      type: String,
      required: true,
      minlength: 0,
      maxlength: 5000,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "EUR",
      uppercase: true,
      trim: true,
    },

    category: {
      type: String,
      // required: true,
      enum: [
        "Electronics",
        "Cars",
        "Clothing",
        "Furniture",
        "Real Estate",
        "Books",
        "Sports",
        "Toys",
        "Other",
      ],
    },

    condition: {
      type: String,
      enum: ["New", "Used", "Refurbished"],
      default: "Used",
    },

    images: [
      {
        type: String,
      },
    ],

    // OWNER OF POST
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],

    location: {
      country: {
        type: String,
        default: "",
        trim: true,
      },

      city: {
        type: String,
        default: "",
        trim: true,
      },
    },

    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],

    views: {
      type: Number,
      default: 0,
    },

    favoritesCount: {
      type: Number,
      default: 0,
    },

    // active | sold | hidden | deleted
    status: {
      type: String,
      enum: ["active", "sold", "hidden", "deleted"],
      default: "active",
      index: true,
    },

    isApproved: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    contactPhone: {
      type: String,
      default: "",
    },

    negotiable: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// SEARCH INDEXES
postSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model('Post', postSchema)