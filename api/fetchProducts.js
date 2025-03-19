// api/fetchProducts.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI; // Access the environment variable

export default async function handler(req, res) {
  const { categoryId } = req.query;

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    await client.connect();
    const database = client.db("moc-studio");
    const productsCollection = database.collection("products");

    const products = await productsCollection.find({ categoryId }).toArray();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await client.close();
  }
}