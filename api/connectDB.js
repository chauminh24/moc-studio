// api/connectDB.js
import { MongoClient, ServerApiVersion } from 'mongodb';

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

    // Access the database
    const database = client.db("your-database-name"); // Replace with your database name
    const collection = database.collection("your-collection-name"); // Replace with your collection name

    // Perform a simple operation, e.g., find the first document in the collection
    const result = await collection.findOne({});

    // Send the result back to the client
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to connect to the database' });
  } finally {
    // Close the connection
    await client.close();
  }
}