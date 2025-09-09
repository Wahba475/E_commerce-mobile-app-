import express from 'express'
import { addToCart, getCart, removeFromCart, updateQuantity, clearCart, getCartItemCount } from '../Controllers/CartController.js'
import UserAuth from '../Middleware/UserAuth.js'

  const CartRouter = express.Router()


CartRouter.post('/add', UserAuth, addToCart)
CartRouter.get('/get', UserAuth, getCart)
CartRouter.put('/update', UserAuth, updateQuantity)
CartRouter.delete('/remove', UserAuth, removeFromCart)
CartRouter.delete('/clear', UserAuth, clearCart)
CartRouter.get('/count', UserAuth, getCartItemCount)

export default CartRouter
