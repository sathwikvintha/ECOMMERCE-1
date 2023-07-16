const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const dbConnect = require("./config/dbConnect");
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 5000;
const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const blogRouter = require("./routes/blogRoute");
const prodcategoryRouter = require("./routes/prodcategoryRoute");
const blogcategoryRouter = require("./routes/blogcategoryRoute");
const brandRouter = require("./routes/brandRoute");
const colorRouter = require("./routes/colorRoute");
const couponRouter = require("./routes/couponRoute");
const uploadRouter = require("./routes/uploadRoute");
const enqRouter = require("./routes/enqRoute");
const cors = require("cors");
const bodyParser = require("body-parser");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
dbConnect();
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  cors({
    origin: ["https://vercel.com/sathwikvintha/ecommerce-1"],
    methods: ["POST", "GET"],
    credentials: true,
  })
);

app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/blog", blogRouter);
app.use("/api/category", prodcategoryRouter);
app.use("/api/blogcategory", blogcategoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/color", colorRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/enquiry", enqRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Serving on port ${PORT}`);
});
