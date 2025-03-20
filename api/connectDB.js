import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

const uri = "mongodb+srv://chomin2401:matkhaucuachau@moc-studio.f7so7.mongodb.net/?retryWrites=true&w=majority&appName=moc-studio";

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

    // Access the database
    const database = client.db("moc-studio");
    console.log("Accessed database:", database.databaseName);

    const products = database.collection("products");
    const categories = database.collection("categories");

    // Fetch all categories
    console.log("Fetching categories...");
    const categoriesResult = await categories.find({}).toArray();
    console.log("Fetched categories:", categoriesResult);

    // Fetch products based on the category name if categoryName is provided
    const { categoryName } = req.query;
    let productsResult = [];
    if (categoryName) {
      console.log("Fetching category for categoryName:", categoryName);
      const category = await categories.findOne({ name: categoryName });
      if (!category) {
        console.error("Category not found:", categoryName);
        return res.status(404).json({ error: 'Category not found' });
      }
      const categoryId = category._id;
      console.log("Fetching products for categoryId:", categoryId);
      productsResult = await products.find({ category_ids: { $in: [categoryId] } }).toArray();
      console.log("Fetched products:", productsResult);
    }

    // Send the result back to the client
    res.status(200).json({ categories: categoriesResult, products: productsResult });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: 'Unable to connect to the database', details: error.message });
  } finally {
    // Close the connection
    await client.close();
    console.log("MongoDB connection closed");
  }
}