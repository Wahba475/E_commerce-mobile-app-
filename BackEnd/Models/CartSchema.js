
import mongoose from "mongoose";
import UserModel from "./UserSchema.js";
import ProductModel from "./ProductsSchema.js";

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, 
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
        min: [0, 'Quantity must be at least 0'],
        validate: {
          validator: Number.isInteger,
          message: 'Quantity must be an integer'
        }
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    },
  ],
  lastModified: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true, 
  minimize: false 
});

const CartModel = mongoose.model("Cart", cartSchema);
export default CartModel;

// Update 