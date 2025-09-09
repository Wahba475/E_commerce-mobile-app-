import ProductModel from '../Models/ProductsSchema.js'

const addProduct = async (req, res) => {
  try{
    const { title, price, description, rating, category, image_link, product_link } = req.body;
   

    const existingProduct = await ProductModel.findOne({ title });
    if(existingProduct){
      return res.status(400).json({ 
        message: "Product already exists", 
        existingProduct 
      });
    }
    
    
    let image = '';
    if (req.file) {
      image = req.file.filename; 
    }
    
   
    const product = await ProductModel.create({ 
      title, 
      price, 
      description, 
      rating, 
      image, 
      image_link, 
      product_link, 
      category 
    });
    
    return res.status(201).json({ 
      message: "Product added successfully", 
      product 
    });
  }
  catch(error){
    console.error('Error adding product:', error);
    return res.status(500).json({ message: error.message });
  }
}
const  listProducts = async (req, res) => {
  try{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const products = await ProductModel.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await ProductModel.countDocuments();
    const totalPages = Math.ceil(total / limit);
    
    return res.status(200).json({ 
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  }
  catch(error){
    return res.status(500).json({ message: error.message });
  }
}
const removeProduct = async (req, res) => {
  try{
    const { id } = req.params;
    const product = await ProductModel.findByIdAndDelete(id);
    return res.status(200).json({ message: "Product deleted successfully", product });
 
  }
  catch(error){
    return res.status(500).json({ message: error.message });
  }
}
const singleProduct = async (req, res) => {
  try{
    const { id } = req.params;
    const product = await ProductModel.findById(id);
       
    if (!product) {
      return res.status(404).json({ 
        message: "Product not found" 
      });
    }
    else{
      return res.status(200).json({ product });
    }
   
  }
  catch(error){
    console.error('Error fetching single product:', error);
    return res.status(500).json({ message: error.message });
  }
}
const updateProduct = async (req, res) => {
  try{
    const { id } = req.params;
    const { title, price, description, rating, category, image_link, product_link } = req.body;
    const product = await ProductModel.findByIdAndUpdate(id, { title, price, description, rating, category, image_link, product_link }, { new: true });
    return res.status(200).json({ message: "Product updated successfully", product });

  }
  catch(error){
    return res.status(500).json({ message: error.message });
  }
}

const searchProducts = async (req, res) => {
  try{
    const { query } = req.query;
    const limit = parseInt(req.query.limit) || 20;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchRegex = new RegExp(query.trim(), 'i');
    const products = await ProductModel.find({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ]
    }).limit(limit);

    return res.status(200).json({
      products,
      total: products.length,
      query: query.trim()
    });

  }
  catch(error){
    console.error('Error searching products:', error);
    return res.status(500).json({ message: error.message });
  }
}

const getProductsByCategory = async (req, res) => {
  try{
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    // Map category IDs to actual database categories
    const categoryMap = {
      'smartphones': ['smartphone', 'phone', 'mobile', 'iphone', 'android'],
      'laptops': ['laptop', 'notebook', 'macbook', 'pc'],
      'headphones': ['headphone', 'earphone', 'earbud', 'audio'],
      'tvs': ['tv', 'television', 'display', 'monitor'],
      'tablets': ['tablet', 'ipad'],
      'cameras': ['camera', 'dslr', 'mirrorless', 'photography'],
      'gaming': ['gaming', 'game', 'console', 'playstation', 'xbox'],
      'smart-home': ['smart home', 'smart', 'iot', 'automation'],
      'accessories': ['accessory', 'charger', 'case', 'cable', 'adapter']
    };

    const searchTerms = categoryMap[category] || [category];
    const searchRegex = new RegExp(searchTerms.join('|'), 'i');

    const products = await ProductModel.find({
      $or: [
        { category: searchRegex },
        { title: searchRegex },
        { description: searchRegex }
      ]
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

    const total = await ProductModel.countDocuments({
      $or: [
        { category: searchRegex },
        { title: searchRegex },
        { description: searchRegex }
      ]
    });

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      category: category
    });

  }
  catch(error){
    console.error('Error fetching products by category:', error);
    return res.status(500).json({ message: error.message });
  }
}

export { addProduct, listProducts, removeProduct, updateProduct, singleProduct, searchProducts, getProductsByCategory }