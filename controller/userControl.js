const { generateToken } = require("../config/jwtToken.js");
const user = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid.js");
const { generateRefreshToken } = require("../config/refreshToken.js");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailController.js");
const crypto = require("crypto");
const Product = require("./../models/productModel.js");
const Cart = require("./../models/cartModel.js");
const Coupon = require("./../models/couponModel.js");
const order = require("./../models/orderModel.js");
const uniqid = require("uniqid");

const createUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    // Create an new user
    const newUser = await User.create(req.body);
    res.status(201).json({ msg: "User created", newUser });
  } else {
    // User already exists
    /*res.status(400).send({
            msg: "User already exists",
            success: false
        })*/
    throw new Error("User already exists");
  }
});

// Login a User
const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists or not
  const findUser = await User.findOne({ email: email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateUser = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      {
        /**
            By default, findOneAndUpdate() returns 
            the document as it was before update was applied. 
            If you set new: true, findOneAndUpdate() 
            will instead give you the object after update was applied.
             */
        new: true,
      }
    );

    /**
         Save the refreshToken in cookies,
         set refreshToken in cookies
        */
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.status(200).json({
      _id: findUser?._id,
      firstName: findUser?.firstName,
      lastName: findUser?.lastName,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid credentials");
  }
});

// admin login
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists or not
  const findAdmin = await User.findOne({ email: email });
  if (findAdmin.role !== "admin") throw new Error("Not authorized");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateUser = await User.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken: refreshToken,
      },
      {
        /**
            By default, findOneAndUpdate() returns 
            the document as it was before update was applied. If you set new: true, findOneAndUpdate() will instead give you the object after update was applied.
             */
        new: true,
      }
    );

    /**
         Save the refreshToken in cookies,
         set refreshToken in cookies
        */
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.status(200).json({
      _id: findAdmin?._id,
      firstName: findAdmin?.firstName,
      lastName: findAdmin?.lastName,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: generateToken(findAdmin?._id),
    });
  } else {
    throw new Error("Invalid credentials");
  }
});

// Handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  //console.log(cookie);
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  //console.log(refreshToken);
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error("No Refresh token presents in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET_KEY, (err, decoded) => {
    //console.log(decoded);
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    // Generate a new access token for user
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
  //res.json(user);
});

// Log out functionality
const logOut = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); // Forbidden
  }
  await User.findOneAndUpdate(refreshToken, {
    refreshToken: "",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); // Forbidden
});

// Update a user
const updateUser = asyncHandler(async (req, res) => {
  //const { id } = req.params;
  // We can get the user with his infos in the req object
  const { _id } = req.user;
  console.log(_id);
  validateMongoDbId(_id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstName: req?.body?.firstName,
        lastName: req?.body?.lastName,
        mobile: req?.body?.mobile,
        email: req?.body?.email,
      },
      {
        /**
           By default, findOneAndUpdate() returns 
           the document as it was before update was applied. If you set new: true, findOneAndUpdate() will instead give you the object after update was applied.
            */
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

// Save User Address
const saveAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body?.address,
      },
      {
        new: true,
      }
    );
    res.json({
      msg: "User updated successfully",
      updatedUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.status(200).json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

// Get a single User
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getUser = await User.findById(id);
    res.status(200).json({ getUser });
  } catch (error) {
    throw new Error(error);
  }
});

// DELETE a User
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    res.status(200).json({
      msg: "User deleted successfully.",
      deletedUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Block a User
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const block = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "User blocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Unblock a User
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "User unblocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  console.log(req.user);
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();

    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found with this email");
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi, Please follow this link to reset your password. 
        This link is valid 10 minutes from now. 
        <a href='http://localhost:3000/reset-password/${token}'>Click Here</a>`;
    const data = {
      to: email,
      text: "Hey User",
      subject: "Forgot Password Link",
      htm: resetURL,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  //  Hashed the token get in req.params and update the token using crypto module
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find the user with the hased token;
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now(),
    } /**  The token expires time must be greather than Date.now(), 
        because the token is valid for now to ten minutes. */,
  });
  if (!user) throw new Error(" Token expired, Please try again later");
  user.password = password;
  user.passwordResetToken = undefined; // We passed undefined because the password was changed we don't need a token
  user.passwordResetExpires = undefined; // We passed undefined because the password was changed we don't need an expires for token
  await user.save();
  res.json(user);
});

const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate("wishlist");
    res.json(findUser);
  } catch (error) {
    throw new Error(error);
  }
});

const userCart = asyncHandler(async (req, res) => {
  const { productId, color, quantity, price } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    let newCart = await Cart({
      userId: _id,
      productId,
      color,
      price,
      quantity,
    }).save();
    res.json(newCart);
  } catch (error) {
    throw new Error(error);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.find({ userId: _id })
      .populate(
        "productId"
        //"_id title price totalAfterDiscount", // Select fields to display
      )
      .populate("color");
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

const removeProductFromCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cartItemId } = req.params;
  validateMongoDbId(_id);
  try {
    const deleteProductFromCart = await Cart.deleteOne({
      userId: _id,
      _id: cartItemId,
    });
    res.json(deleteProductFromCart);
  } catch (error) {
    throw new Error(error);
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const deleteCart = await Cart.deleteMany({
      userId: _id,
    });
    res.json(deleteCart);
  } catch (error) {
    throw new Error(error);
  }
});

const updateProductQuantityFromCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cartItemId, newQuantity } = req.params;
  validateMongoDbId(_id);
  try {
    const cartItem = await Cart.findOne({
      userId: _id,
      _id: cartItemId,
    });
    cartItem.quantity = newQuantity;
    cartItem.save();
    res.json(cartItem);
  } catch (error) {
    throw new Error(error);
  }
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  const { coupon } = req.body;
  const validCoupon = await Coupon.findOne({ name: coupon });
  //console.log(validCoupon);
  if (validCoupon === null) {
    throw new Error("Invalid Coupon");
  }

  const user = await User.findOne({ _id });
  let { products, cartTotal } = await Cart.findOne({
    orderBy: user._id,
  }).populate("products.product");
  let totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);
  await Cart.findOneAndUpdate(
    { orderBy: user._id },
    { totalAfterDiscount },
    { new: true }
  );
  res.json(totalAfterDiscount);
});

const createOrder = asyncHandler(async (req, res) => {
  const {
    shippingInfo,
    orderItems,
    totalPrice,
    totalPriceAfterDiscount,
    paymentInfo,
  } = req.body;
  const { _id } = req.user;
  try {
    const order = await Order.create({
      shippingInfo,
      orderItems,
      totalPrice,
      totalPriceAfterDiscount,
      paymentInfo,
      user: _id,
    });
    res.json({
      order,
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const orders = await Order.find({ user: _id })
      .populate("user")
      .populate("orderItems.product")
      .populate("orderItems.color");
    res.json({
      orders,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const allOrders = await Order.find().populate("user");
    res.json(allOrders);
  } catch (error) {
    throw new Error(error);
  }
});
const getSingleOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const orders = await Order.findOne({ _id: id })
      .populate("orderItems.product")
      .populate("orderItems.color");
    res.json({ orders });
  } catch (error) {
    throw new Error(error);
  }
});
const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const orders = await Order.findById(id);
    orders.orderStatus = req.body.status;
    await orders.save();
    res.json({ orders });
  } catch (error) {
    throw new Error(error);
  }
});
const getOrderByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const userorders = await Order.find({ user: id })
      .populate("user")
      .populate("orderItems.product")
      .populate("orderItems.color");
    res.json(userorders);
  } catch (error) {
    throw new Error(error);
  }
});

const getMonthWiseOrderIncome = asyncHandler(async (req, res) => {
  let monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let d = new Date();
  let endDate = "";
  d.setDate(1);
  for (let index = 0; index < 11; index++) {
    d.setMonth(d.getMonth() - 1);
    endDate = monthNames[d.getMonth()] + "" + d.getFullYear();
  }
  const data = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $lte: new Date(),
          $gte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: {
          month: "$month",
        },
        amount: { $sum: "$totalPriceAfterDiscount" },
        count: { $sum: 1 },
      },
    },
  ]);
  res.json(data);
});

const getYearlyTotalOrders = asyncHandler(async (req, res) => {
  let monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let d = new Date();
  let endDate = "";
  d.setDate(1);
  for (let index = 0; index < 11; index++) {
    d.setMonth(d.getMonth() - 1);
    endDate = monthNames[d.getMonth()] + "" + d.getFullYear();
  }
  const data = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $lte: new Date(),
          $gte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        amount: { $sum: "$totalPriceAfterDiscount" },
      },
    },
  ]);
  res.json(data);
});

module.exports = {
  createUser,
  loginUserCtrl,
  logOut,
  updateUser,
  getAllUsers,
  blockUser,
  unblockUser,
  handleRefreshToken,
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
  getAllOrders,
  getOrderByUserId,
  getYearlyTotalOrders,
  getMonthWiseOrderIncome,
  updateOrder,
  getSingleOrder,
  getMyOrders,
  updateProductQuantityFromCart,
  removeProductFromCart,
  deleteUser,
  getUserById,
};
