import express from 'express';
import * as productController from '../controllers/productControllers.js';
import { uploadImages } from '../middleware/upload.js'; // ← correct export name

const router = express.Router();

router.get('/',       productController.getProducts);
router.get('/:id',    productController.getProductById);
router.post('/',      uploadImages, productController.createProduct);  // ← fixed
router.put('/:id',    uploadImages, productController.updateProduct);  // ← fixed
router.delete('/:id', productController.deleteProduct);

export default router;