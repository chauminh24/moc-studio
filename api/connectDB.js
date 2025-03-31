import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const uri = "mongodb+srv://chomin2401:matkhaucuachau@moc-studio.f7so7.mongodb.net/?retryWrites=true&w=majority&appName=moc-studio";
const JWT_SECRET = "matkhaucuachau";

export default async function handler(req, res) {
  console.log("Attempting to connect to MongoDB...");

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("moc-studio");

    // Handle different API requests based on query parameters
    const { type } = req.query;

    if (type === 'login') {
      // Handle login
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const usersCollection = database.collection("users");
      const user = await usersCollection.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

      return res.status(200).json({
        message: 'Login successful',
        user: { id: user._id, email: user.email, name: user.name },
        token,
      });
    } else if (type === 'interiorConsulting') {
      // Fetch consulting data
      const availabilityCollection = database.collection("consulting_availability");
      const projectsCollection = database.collection("interior_projects");
      const sessionsCollection = database.collection("consulting_sessions");

      const availability = await availabilityCollection.find({}).toArray();
      const projects = await projectsCollection.find({}).toArray();
      const sessions = await sessionsCollection.find({}).toArray();

      return res.status(200).json({
        availability,
        projects,
        sessions,
      });
    } else if (type === 'categoriesAndProducts') {
      // Existing logic for categories and products
      const categories = database.collection("categories");
      const products = database.collection("products");

      const categoriesResult = await categories.find({}).toArray();
      const { categoryName } = req.query;
      let productsResult = [];

      if (categoryName) {
        const trimmedCategoryName = categoryName.trim();
        const category = await categories.findOne({ name: trimmedCategoryName });
        if (!category) {
          return res.status(404).json({ error: 'Category not found' });
        }
        const categoryId = new ObjectId(category._id);
        productsResult = await products.find({ category_ids: categoryId }).toArray();
      }

      return res.status(200).json({ categories: categoriesResult, products: productsResult });
    
    } else if (type === 'search') {
      // Search products by query
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }
    
      const productsCollection = database.collection("products");
      const searchResults = await productsCollection
        .find({ name: { $regex: query, $options: "i" } }) // Case-insensitive search
        .toArray();
    
      return res.status(200).json({ products: searchResults });  
    
    } else {
      return res.status(400).json({ error: 'Invalid request type' });
    }
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: 'Unable to connect to the database', details: error.message });
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}