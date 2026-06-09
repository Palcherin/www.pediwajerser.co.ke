import express from 'express';
import * as productController from '../controllers/productControllers.js';
import { uploadImage} from '../middleware/upload.js';

const router = express.Router();

router.get('/',     productController.getProducts);
router.get('/:id',  productController.getProductById);   // ← add this
router.post('/',    uploadImage, productController.createProduct);
router.put('/:id',  uploadImage, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;