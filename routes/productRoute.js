const express = require("express");
const {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishlist,
  uploadImages,
  deleteImages,
  rating,
} = require("../controller/productController");

const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const {
  uploadPhoto,
  productImgResize,
} = require("../middlewares/uploadImages");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createProduct);

router.get("/:id", getaProduct);
router.put("/wishlist", authMiddleware, addToWishlist);
// router.delete("/delete-img/:id", authMiddleware, isAdmin, deleteImages);
router.put("/rating", authMiddleware, rating);

router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

router.get("/", getAllProduct);

module.exports = router;
