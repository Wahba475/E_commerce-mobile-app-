import CartModel from "../Models/CartSchema.js";
import ProductModel from "../Models/ProductsSchema.js";


const addToCart = async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity = 1 } = req.body;

  // Input validation
  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ message: "Quantity must be a positive integer" });
  }

  // Verify product exists and get stock info
  const product = await ProductModel.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Check stock availability (assuming product has stock field)
  if (product.stock && product.stock < quantity) {
    return res.status(400).json({ message: "Insufficient stock available" });
  }

  let cart = await CartModel.findOne({ user: userId });

  if (cart) {
    const productIndex = cart.products.findIndex(
      (p) => p.product.toString() === productId
    );

    if (productIndex > -1) {
      const newQuantity = cart.products[productIndex].quantity + quantity;
      
      // Check total quantity against stock
      if (product.stock && product.stock < newQuantity) {
        return res.status(400).json({ message: "Cannot add more items - insufficient stock" });
      }
      
      cart.products[productIndex].quantity = newQuantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }
    
    cart.lastModified = new Date();
    await cart.save();
    // Populate product details for response
    await cart.populate('products.product', 'title price description image category rating');
    res.status(200).json(cart);
  } else {
    const newCart = await CartModel.create({
      user: userId,
      products: [{ product: productId, quantity }],
    });
    await newCart.populate('products.product', 'title price description image category rating');
    res.status(201).json(newCart);
  }
};

const getCart = async (req, res) => {
  const userId = req.user.id;
  
  const cart = await CartModel.findOne({ user: userId })
    .populate('products.product', 'title price description image category rating'); // Populate all needed fields
  
  // Return empty cart structure if no cart exists
  if (!cart) {
    return res.status(200).json({
      user: userId,
      products: [],
      totalItems: 0,
      totalAmount: 0
    });
  }

  // Calculate totals
  const totalItems = cart.products.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.products.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);

  res.status(200).json({
    ...cart.toObject(),
    totalItems,
    totalAmount
  });
};

const removeFromCart = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  const updatedCart = await CartModel.findOneAndUpdate(
    { user: userId },
    { $pull: { products: { product: productId } } },
    { new: true }
  ).populate('products.product', 'title price description image category rating');

  if (!updatedCart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  res.status(200).json(updatedCart);
};

const updateQuantity = async (req, res) => {
  const userId = req.user.id;
  const { productId, newQuantity } = req.body;

  // Input validation
  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  if (!Number.isInteger(newQuantity) || newQuantity < 0) {
    return res.status(400).json({ message: "Quantity must be a non-negative integer" });
  }

  // If quantity is 0, remove the item
  if (newQuantity === 0) {
    return removeFromCart(req, res);
  }

  // Verify product exists and check stock
  const product = await ProductModel.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (product.stock && product.stock < newQuantity) {
    return res.status(400).json({ message: "Insufficient stock available" });
  }

  const cart = await CartModel.findOne({ user: userId });

  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  const productIndex = cart.products.findIndex(
    (p) => p.product.toString() === productId
  );

  if (productIndex > -1) {
    cart.products[productIndex].quantity = newQuantity;
    cart.lastModified = new Date();
    await cart.save();
    await cart.populate('products.product', 'title price description image category rating');
    return res.status(200).json(cart);
  }

  return res.status(404).json({ message: 'Product not found in cart' });
};

const clearCart = async (req, res) => {
  const userId = req.user.id;
  
  const deletedCart = await CartModel.findOneAndDelete({ user: userId });
  
  if (!deletedCart) {
    return res.status(404).json({ message: "Cart not found" });
  }
  
  res.status(200).json({ message: "Cart cleared successfully" });
};

const getCartItemCount = async (req, res) => {
  const userId = req.user.id;
  const cart = await CartModel.findOne({ user: userId });
  
  const itemCount = cart ? cart.products.reduce((sum, item) => sum + item.quantity, 0) : 0;
  
  res.status(200).json({ itemCount });
};

export { addToCart, getCart, removeFromCart, updateQuantity, clearCart, getCartItemCount };
