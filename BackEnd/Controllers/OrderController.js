import OrderModel from "../Models/orderSchema.js";
import UserModel from "../Models/UserSchema.js";
import CartModel from "../Models/CartSchema.js";
import ProductModel from "../Models/ProductsSchema.js";
import Stripe from "stripe";

const currency = "usd";
const shipping = 10.0;
//GETWAY initializion
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Cash on Delivery Method
const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from JWT token
    const { items, amount, address } = req.body;

    // Process items to ensure all have proper image data
    const processedItems = await Promise.all(
      items.map(async (item) => {
        // If item doesn't have image or image is null/undefined, fetch from product
        if (!item.image) {
          try {
            const product = await ProductModel.findById(item.productId);
            if (product) {
              item.image = product.image || product.image_link || null;
            }
          } catch (error) {
            console.log(
              `Could not fetch image for product ${item.productId}:`,
              error.message
            );
          }
        }
        return item;
      })
    );

    // create order
    const order = await OrderModel.create({
      userId,
      items: processedItems,
      amount,
      address,
      paymentMethod: "Cash on Delivery",
      payment: false,
      date: new Date(),
    });

    // clear cart data from both UserModel and CartModel
    await UserModel.findByIdAndUpdate(userId, { CartData: {} });
    await CartModel.findOneAndDelete({ user: userId });

    return res
      .status(200)
      .json({ message: "Order placed successfully", order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const placeOrderStripe = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        message: "Stripe is not configured. Please set STRIPE_SECRET_KEY.",
      });
    }

    const userId = req.user.id;
    const { items, amount, address } = req.body;
    const { origin } = req.headers;

    const order = await OrderModel.create({
      userId,
      items,
      amount,
      address,
      paymentMethod: "Stripe",
      payment: false,
      date: new Date(),
    });

    const line_items = items.map((item) => ({
      price_data: {
        currency,
        product_data: { name: item.productName },
        unit_amount: item.price * 100, // cents
      },
      quantity: item.quantity,
    }));

    // ✅ fix shipping object
    line_items.push({
      price_data: {
        currency,
        product_data: { name: "Shipping" },
        unit_amount: shipping * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // safer
      mode: "payment",
      line_items,
      success_url: `${origin}/verify?success=true&orderId=${order._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${order._id}`,
    });

    return res.status(200).json({ session });
  } catch (error) {
    console.error("Stripe Error:", error);
    return res.status(500).json({ message: "An error occurred while processing your payment. Please try again later." });
    }
};



// Get All Orders Adminpanel
const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await OrderModel.find();
    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const allsUsersOrders = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from JWT token
    const orders = await OrderModel.find({ userId: userId });

    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment } = req.body;

    const order = await OrderModel.findByIdAndUpdate(
      id,
      { payment },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Payment status updated successfully",
      order
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: error.message });
  }
};



export {
  placeOrder,
  placeOrderStripe,
  getAllOrdersAdmin,
  allsUsersOrders,
  updateOrderStatus,
  updatePaymentStatus,
};
