import express from 'express'
import upload from '../Middleware/multer.js'
import adminAuth from '../Middleware/adminAuth.js'
import { addProduct, listProducts, removeProduct, updateProduct, singleProduct, searchProducts, getProductsByCategory } from '../Controllers/ProductController.js'

const ProductsRouter = express.Router()


ProductsRouter.post('/add', adminAuth, upload.single('image'), addProduct)
ProductsRouter.get('/list', listProducts)
ProductsRouter.get('/search', searchProducts)
ProductsRouter.get('/category/:category', getProductsByCategory)
ProductsRouter.delete('/remove/:id', adminAuth, removeProduct)
ProductsRouter.get('/single/:id', singleProduct)
ProductsRouter.put('/update/:id', adminAuth, updateProduct)

export default ProductsRouter
