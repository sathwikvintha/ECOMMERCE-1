const express = require("express");
const {
  createUser,
  loginUserControl,
  getallUser,
  getaUser,
  deleteaUser,
  updatedUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishlist,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
  getAllOrders,
  removeProductFromCart,
  updateProductQuantityFromCart,
} = require("../controller/userControl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
// import { checkout, paymentVerification } from "../controller/paymentController";
const {
  checkout,
  paymentVerification,
} = require("../controller/paymentController");
const router = express.Router();
router.post("/register", createUser);
router.post("/forgot-password-token", forgotPasswordToken);

router.put("/reset-password/:token", resetPassword);

router.put("/password", authMiddleware, updatePassword);
router.post("/login", loginUserControl);
router.post("/admin-login", loginAdmin);
router.post("/cart", authMiddleware, userCart);
router.post("/order/checkout", authMiddleware, checkout);
router.post("/order/paymentVerification", authMiddleware, paymentVerification);
// router.post("/cart/applycoupon", authMiddleware, applyCoupon);
router.post("/cart/create-order", authMiddleware, createOrder);
router.get("/all-users", getallUser);
// router.get("/get-orders", authMiddleware, getOrders);
// router.get("/getallorders", authMiddleware, isAdmin, getAllOrders);
// router.post("/getorderbyuser/:id", authMiddleware, isAdmin, getAllOrders);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get("/wishlist", authMiddleware, getWishlist);
router.get("/cart", authMiddleware, getUserCart);

router.get("/:id", authMiddleware, isAdmin, getaUser);
router.delete(
  "/delete-product-cart/:cartItemId",
  authMiddleware,
  removeProductFromCart
);
router.delete(
  "/update-product-cart/:cartItemId/:newQuantity",
  authMiddleware,
  updateProductQuantityFromCart
);
// router.delete("/empty-cart", authMiddleware, emptyCart);
router.delete("/:id", deleteaUser);
// router.put(
//   "/order/update-order/:id",
//   authMiddleware,
//   isAdmin,
//   updateOrderStatus
// );
router.put("/edit-user", authMiddleware, updatedUser);
router.put("/save-address", authMiddleware, saveAddress);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);

module.exports = router;
