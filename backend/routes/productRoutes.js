const express = require('express');
const router = express.Router();
const { addProduct, getProducts, getProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { upload } = require('../config/cloudinary');

router.post('/', upload.any(), addProduct);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.put('/:id', upload.any(), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
