import { MongoClient } from "mongodb";

async function run() {
  const uri = "mongodb+srv://chomin2401:matkhaucuachau@moc-studio.f7so7.mongodb.net/?retryWrites=true&w=majority&appName=moc-studio";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("moc-studio");

    await db.createCollection("product_media", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["product_id", "media_type", "file_path"],
          properties: {
            product_id: { bsonType: "objectId", description: "Reference to the product document" },
            media_type: { enum: ["image", "video", "3d_model"], description: "Type of media" },
            file_path: { bsonType: "string", description: "Relative path to the file" },
            is_primary: { bsonType: "bool", description: "Primary media flag" },
            created_at: { bsonType: "date", description: "Creation date" },
            updated_at: { bsonType: "date", description: "Last update date" },
          },
        },
      },
    });

    console.log("Collection created successfully!");
  } finally {
    await client.close();
  }
}

run().catch(console.dir);