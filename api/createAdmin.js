import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

const uri = "mongodb+srv://chomin2401:matkhaucuachau@moc-studio.f7so7.mongodb.net/?retryWrites=true&w=majority&appName=moc-studio";

async function createAdmin() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("moc-studio");
    const usersCollection = database.collection("users");

    // Check if the admin account already exists
    const existingAdmin = await usersCollection.findOne({ email: "admin@moc.studio.com" });
    if (existingAdmin) {
      console.log("Admin account already exists");
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("adminlogin", 10);

    // Create the admin user
    const adminUser = {
      email: "admin@moc.studio.com",
      password: hashedPassword,
      name: "Admin",
      role: "admin", // Set the role to admin
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
    };

    // Insert the admin user into the database
    const result = await usersCollection.insertOne(adminUser);
    console.log("Admin account created successfully:", result.insertedId);
  } catch (error) {
    console.error("Error creating admin account:", error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

createAdmin();