const Razorpay = require("razorpay");
// import dotenv from "dotenv";
// dotenv.config();

const instance = new Razorpay({
  /**These key you can generate them in your razorpay account */
  key_id: "rzp_test_0zdEWhxgcWvm4B",
  key_secret: "8dT269YwIe4dLDwVLtIeaRvJ",
});

const checkout = async (req, res) => {
  const { amount } = req.body;
  const option = {
    amount: amount * 100,
    currency: "INR",
  };
  const order = await instance.orders.create(option);
  res.json({
    success: true,
    order,
  });
  console.log(order);
};

const paymentVerification = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId } = req.body;
  res.json({
    razorpayOrderId,
    razorpayPaymentId,
  });
};

module.exports = {
  checkout,
  paymentVerification,
};
