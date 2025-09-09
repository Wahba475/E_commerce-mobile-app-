import Products from './Models/Data/Products.js'
import Product from './Models/ProductsSchema.js'
import connectDB from './Config/mongodb.js'
import dotenv from 'dotenv'


dotenv.config()

const importData = async () => {
    try {
        console.log('Connecting to database...');
        await connectDB();
        
        console.log('Clearing existing products...');
        await Product.deleteMany(); 
        
        // Fix the nested array structure and convert string values to numbers
        console.log('Processing products data...');
        console.log('Products type:', typeof Products);
        console.log('Products.length:', Products.length);
        console.log('Products[0] type:', typeof Products[0]);
        console.log('Products[0] length:', Array.isArray(Products[0]) ? Products[0].length : 'not array');
        
        let processedProducts = Products;
        
        // If Products is nested in an array, flatten it
        if (Array.isArray(Products[0])) {
            console.log('Flattening nested array...');
            processedProducts = Products[0];
        }
        
        // Process each product to fix data types
        const cleanProducts = processedProducts.map(product => {
            // Convert price from string to number
            let price = product.price;
            if (typeof price === 'string') {
                price = parseFloat(price.replace('$', ''));
            }
            
            // Convert rating from string to number
            let rating = product.rating;
            if (typeof rating === 'string') {
                rating = parseFloat(rating.split(' ')[0]); // Extract just the number
            }
            
            return {
                title: product.title,
                price: price,
                description: product.description,
                rating: rating,
                image: product.image,
                image_link: product.image_link,
                product_link: product.product_link,
                category: product.category
            };
        });
        
        console.log(`Processing ${cleanProducts.length} products...`);
        console.log('Sample product:', cleanProducts[0]);
        
        console.log('Inserting new products...');
        const result = await Product.insertMany(cleanProducts);
        
        console.log(`Data Imported Successfully! ${result.length} products added.`);
        process.exit(0);
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
};

importData();