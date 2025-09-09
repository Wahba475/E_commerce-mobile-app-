import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
// Using built-in fetch (Node.js 18+)
import connectDB from './Config/mongodb.js'
import ProductModel from './Models/ProductsSchema.js'
import UserRouter from './routes/UserRoute.js'
import ProductsRouter from './routes/ProductsRoute.js'
import OrderRouter from './routes/OrderRoute.js'
import CartRouter from './routes/CartRoute.js'




dotenv.config()

connectDB()


const app = express()
const port = process.env.PORT || 5000


app.use(express.json())
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'))

// Proxy route for external images to avoid CORS issues
app.get('/proxy-image', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    console.log('Proxying image:', url);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    res.set({
      'Content-Type': response.headers.get('content-type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    });
    
    res.send(buffer);
  } catch (error) {
    console.error('Error proxying image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});


app.get('/', (req, res) => {
    res.send('API is Running')
})
app.use('/user', UserRouter)
app.use('/products', ProductsRouter)
app.use('/cart', CartRouter)
app.use('/order', OrderRouter)



app.get("/api/products", async (req, res) => {
    const products = await ProductModel.find(); // from MongoDB
    res.json(products);
  });
  

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})





