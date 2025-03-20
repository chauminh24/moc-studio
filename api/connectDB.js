// api/connectDB.js
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

const uri = "mongodb+srv://chomin2401:matkhaucuachau@moc-studio.f7so7.mongodb.net/?retryWrites=true&w=majority&appName=moc-studio";

export default async function handler(req, res) {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log("Connected to MongoDB");

    // Access the database
    const database = client.db("moc-studio"); // Replace with your database name
    const products = database.collection("products"); // Replace with your collection name
    const categories = database.collection("categories"); // Replace with your collection name

    // Fetch all categories
    const categoriesResult = await categories.find({}).toArray();
    console.log("Fetched categories:", categoriesResult);

    // Fetch products based on the category if categoryId is provided
    const { categoryId } = req.query;
    let productsResult = [];
    if (categoryId) {
      console.log("Fetching products for categoryId:", categoryId);
      productsResult = await products.find({ category_ids: { $in: [ObjectId(categoryId)] } }).toArray();
      console.log("Fetched products:", productsResult);
    }

    // Send the result back to the client
    res.status(200).json({ categories: categoriesResult, products: productsResult });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: 'Unable to connect to the database' });
  } finally {
    // Close the connection
    await client.close();
    console.log("MongoDB connection closed");
  }
}