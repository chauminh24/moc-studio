import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'; // For sending emails

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
    const { type } = req.query;

    if (type === 'register') {
      // Handle registration
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ message: 'Email, password, and name are required' });
      }

      const usersCollection = database.collection("users");
      const existingUser = await usersCollection.findOne({ email });

      if (existingUser) {
        return res.status(409).json({ message: 'Email is already registered' });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        email,
        password: hashedPassword,
        name,
        role: "user", // Default role
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null, // Set to null initially
      };

      const result = await usersCollection.insertOne(newUser);

      return res.status(201).json({
        message: 'Registration successful',
        user: { id: result.insertedId, email, name, role: newUser.role },
      });
    } else if (type === 'login') {
      // Existing login logic
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

      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

      // Update lastLogin field
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { lastLogin: new Date() } }
      );

      return res.status(200).json({
        message: 'Login successful',
        user: { id: user._id, email: user.email, name: user.name, role: user.role },
        token,
      });
    } else if (type === 'forgot-password') {
      // Handle forgot password
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const usersCollection = database.collection("users");
      const user = await usersCollection.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: 'Email not found' });
      }

      // Generate a reset token
      const resetToken = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });

      // Send reset email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'mocstudio.service@gmail.com', // Replace with your email
          pass: 'xugj sful xsfr jzan', // Replace with your email password
        },
      });

      const resetLink = `https://moc-studio-eight.vercel.app/reset-password?token=${resetToken}`; const mailOptions = {
        from: 'mocstudio.service@gmail.com',
        to: email,
        subject: 'Reset Your MOC Studio Password',
        html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">MOC Studio Password Reset</h2>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <a href="${resetLink}" 
         style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">
         Reset Password
      </a>
      <p>If you didn't request this, please ignore this email.</p>
      <p style="font-size: 12px; color: #777;">© ${new Date().getFullYear()} MOC Studio. All rights reserved.</p>
    </div>
  `,
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({ message: 'Password reset email sent' });

    } else if (type === 'interiorConsulting') {
      // Existing logic for interior consulting
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
      // Existing search logic
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