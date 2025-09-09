import express from "express";
import adminAuth from "../Middleware/adminAuth.js";
import UserAuth from "../Middleware/UserAuth.js";
import { placeOrder, placeOrderStripe, getAllOrdersAdmin, allsUsersOrders, updateOrderStatus, updatePaymentStatus } from "../Controllers/OrderController.js";

const OrderRouter = express.Router();

//admin panel routes
OrderRouter.put("/status", adminAuth, updateOrderStatus);
OrderRouter.get("/list-admin", adminAuth, getAllOrdersAdmin);

 // payment routes
OrderRouter.post("/place-order",UserAuth, placeOrder);
OrderRouter.post("/stripe", UserAuth, placeOrderStripe);

// user panel routes
OrderRouter.patch("/update-payment/:id", UserAuth, updatePaymentStatus);
OrderRouter.get("/list-user", UserAuth, allsUsersOrders);


export default OrderRouter;