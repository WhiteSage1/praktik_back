import mongoose from "mongoose";

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
      minlength: 10,
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
    },

    category: {
      type: String,
      required: true,
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

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
      },

      city: {
        type: String,
        default: "",
      },
    },

    tags: [
      {
        type: String,
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

    status: {
      type: String,
      enum: ["active", "sold", "deleted", "hidden"],
      default: "active",
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

export default mongoose.model("Post", postSchema);