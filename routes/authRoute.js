import express from "express";
import {
  createUser,
  getAllUsers,
  loginUserCtrl,
  getUserById,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logOut,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishlist,
  saveAddress,
  userCart,
  getUserCart,
  //emptyCart,
  //applyCoupon,
  createOrder,
  // updateOrderStatus,
  removeProductFromCart,
  updateProductQuantityFromCart,
  getMyOrders,
  getAllOrders,
  emptyCart,
  getMonthWiseOrderIncome,
  getYearlyTotalOrders,
  getSingleOrder,
  updateOrder,
} from "../controllers/userCtrl.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import { checkout, paymentVerification } from "../controllers/paymentCtrl.js";

// Create an express authRouter
const authRouter = express.Router();

authRouter.post("/register", createUser);
authRouter.post("/forgot-password-token", forgotPasswordToken);
authRouter.put("/reset-password/:token", resetPassword);
//authRouter.put('/order/update-order/:id', authMiddleware, isAdmin, updateOrderStatus);
authRouter.put(
  "/password",
  authMiddleware,
  updatePassword
); /**We need  authMiddleware to get the user by req.user then get the user _id */
authRouter.post("/login", loginUserCtrl);
authRouter.post("/admin-login", loginAdmin);
authRouter.post("/cart", authMiddleware, userCart);
authRouter.post("/order/checkout", authMiddleware, checkout);
authRouter.post(
  "/order/paymentVerification",
  authMiddleware,
  paymentVerification
);
//authRouter.post('/cart/applycoupon', authMiddleware, applyCoupon);
authRouter.post("/cart/create-order", authMiddleware, createOrder);
//authRouter.post('/order/cash-order', authMiddleware, createOrder);
authRouter.get("/all-users", getAllUsers);
authRouter.get("/getmyorders", authMiddleware, getMyOrders);
authRouter.get("/getallorders", authMiddleware, isAdmin, getAllOrders);
authRouter.get("/getaOrder/:id", authMiddleware, isAdmin, getSingleOrder);
authRouter.put("/updateOrder/:id", authMiddleware, isAdmin, updateOrder);
//authRouter.post('/getorderbyuser/:id', authMiddleware, isAdmin, getAllOrders);
authRouter.get("/refresh", handleRefreshToken);
authRouter.get("/logout", logOut);
authRouter.get("/wishlist", authMiddleware, getWishlist);
authRouter.get("/cart", authMiddleware, getUserCart);
authRouter.get(
  "/getMonthWiseOrderIncome",
  authMiddleware,
  getMonthWiseOrderIncome
);
authRouter.get("/getYearlyTotalOrders", authMiddleware, getYearlyTotalOrders);

authRouter.get("/:id", authMiddleware, isAdmin, getUserById); // Only an admin can access to a User infos
//authRouter.delete('/empty-cart', authMiddleware, emptyCart);
authRouter.delete(
  "/delete-product-cart/:cartItemId",
  authMiddleware,
  removeProductFromCart
);
authRouter.delete(
  "/update-product-cart/:cartItemId/:newQuantity",
  authMiddleware,
  updateProductQuantityFromCart
);
authRouter.delete("/empty-cart", authMiddleware, emptyCart);
authRouter.delete("/:id", authMiddleware, isAdmin, deleteUser);
authRouter.put("/edit-user", authMiddleware, updateUser);
authRouter.put("/save-address", authMiddleware, saveAddress);
authRouter.put("/block-user/:id", authMiddleware, isAdmin, blockUser); // Only an admin can block users
authRouter.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser); // Only an admin can unblock users

export default authRouter;
