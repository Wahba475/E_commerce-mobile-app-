import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },

  
  price: { 
    type: Number, 
    required: true,
    set: (val) => {
      if (typeof val === 'string') {
        return parseFloat(val.replace(/[^0-9.]/g, '')); 
      }
      return val;
    }
  },

  description: { type: String, required: true },

  
  rating: { 
    type: Number, 
    required: false,
    set: (val) => {
      if (typeof val === 'string') {
        return parseFloat(val.split(' ')[0]); 
      }
      return val;
    }
  },

  image: { type: String, required: false },
  image_link: { type: String, required: false },
  product_link: { type: String, required: false },
  category: { type: String, required: true },
});

const ProductModel = mongoose.model('Product', productSchema);
export default ProductModel;
