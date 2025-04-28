import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'; // For sending emails

const uri = "mongodb+srv://chomin2401:matkhaucuachau@moc-studio.f7so7.mongodb.net/?retryWrites=true&w=majority&appName=moc-studio";
const JWT_SECRET = "matkhaucuachau";

export default async function handler(req, res) {
  console.log("Attempting to connect to MongoDB...");
  console.log("Request body:", req.body);

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

    console.log("Request type:", type);

    if (type === 'productDetails') {
      const { productId } = req.query;

      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const productsCollection = database.collection("products");
      const reviewsCollection = database.collection("product_reviews");
      const mediaCollection = database.collection("product_media");

      const product = await productsCollection.findOne({ _id: new ObjectId(productId) });
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const reviews = await reviewsCollection.find({ product_id: new ObjectId(productId) }).toArray();
      const media = await mediaCollection.find({ product_id: new ObjectId(productId) }).toArray();
      const relatedProducts = await productsCollection
        .find({ category_ids: { $in: product.category_ids }, _id: { $ne: new ObjectId(productId) } })
        .limit(3)
        .toArray();

      return res.status(200).json({ product, reviews, media, relatedProducts });
    } else if (type === 'register') {
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
        createdAt: new Date(), // Ensure this is a valid Date object
        updatedAt: new Date(), // Optional but recommended
        lastLogin: null, // Optional
      };

      // Log the document to verify its structure
      console.log("Document to be inserted:", newUser);

      let result; // Declare result outside the try block
      try {
        result = await usersCollection.insertOne(newUser);
        console.log("User registered successfully:", result.insertedId);
      } catch (error) {
        console.error("MongoDB Validation Error:", error);
        return res.status(500).json({ message: "Registration failed", details: error.message });
      }

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
        user: {
          user_id: user._id, // Return _id as user_id
          email: user.email,
          name: user.name,
          role: user.role,
        },        token,
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
        tls: {
          rejectUnauthorized: false, // Allow self-signed certificates (if needed)
        },
      });

      const resetLink = `https://moc-studio-eight.vercel.app/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: 'mocstudio.service@gmail.com',
        to: email,
        subject: 'Reset Your MOC Studio Password',
        text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nIf you didn't request this, please ignore this email.`,
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

    }else if (type === 'verify-token') {
      // Verify password reset token
      const { token } = req.body;
      console.log("Received token:", token);
    
      if (!token) {
        return res.status(400).json({ message: 'Token is required' });
      }
    
      try {
        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("Decoded token:", decoded);
        
        // Check if user still exists
        const usersCollection = database.collection("users");
        const user = await usersCollection.findOne({ _id: new ObjectId(decoded.id) });
    
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        return res.status(200).json({ 
          message: 'Token is valid',
          email: decoded.email 
        });
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token has expired' });
        }
        return res.status(401).json({ message: 'Invalid token' });
      }
    } else if (type === 'reset-password') {
      // Handle password reset
      const { token, newPassword } = req.body;
    
      if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
      }
    
      if (newPassword.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
      }
    
      try {
        // Verify token first
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const usersCollection = database.collection("users");
        const user = await usersCollection.findOne({ _id: new ObjectId(decoded.id) });
    
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
    
        // Update password and clear any reset tokens
        await usersCollection.updateOne(
          { _id: user._id },
          { 
            $set: { 
              password: hashedPassword,
              lastPasswordChange: new Date() 
            }
          }
        );
    
        return res.status(200).json({ message: 'Password reset successfully' });
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token has expired' });
        }
        return res.status(401).json({ message: 'Invalid token' });
      }
    }
    else if (type === 'userOrders') {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
    
      const ordersCollection = database.collection("orders");
      const orderItemsCollection = database.collection("order_items");
    
      // Fetch orders for the user
      const orders = await ordersCollection
        .find({ user_id: new ObjectId(userId) })
        .sort({ placed_at: -1 })
        .toArray();
    
      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await orderItemsCollection
            .find({ order_id: order._id })
            .toArray();
          return { ...order, items };
        })
      );
    
      return res.status(200).json({ orders: ordersWithItems });
    }else if (type === 'updateUser') {
      const { userId, name, currentPassword, newPassword } = req.body;
    
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
    
      const usersCollection = database.collection("users");
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
    
      // Verify current password if changing password
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ error: 'Current password is required' });
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ error: 'Current password is incorrect' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $set: { password: hashedPassword, name, updatedAt: new Date() } }
        );
      } else {
        await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $set: { name, updatedAt: new Date() } }
        );
      }
    
      return res.status(200).json({ message: 'User updated successfully' });
    }
    else if (type === 'createOrder') {
      const { orderData } = req.body;
    
      if (!orderData || !orderData.items || orderData.items.length === 0) {
        return res.status(400).json({ error: 'Invalid order data' });
      }
    
      const ordersCollection = database.collection("orders");
      const orderItemsCollection = database.collection("order_items");
    
      // Create the order document
      const newOrder = {
        user_id: orderData.user_id ? new ObjectId(orderData.user_id) : null,
        total_price: { $numberDecimal: orderData.total_price.toString() },
        order_status: "pending",
        shipping_address: orderData.shipping_address,
        placed_at: new Date(),
        estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
        payment_method: orderData.payment_method || null, // Optional
      };
    
      // Insert the order
      const orderResult = await ordersCollection.insertOne(newOrder);
      const orderId = orderResult.insertedId;
    
      // Insert order items
      const orderItems = orderData.items.map(item => ({
        order_id: orderId,
        product_id: new ObjectId(item.product_id),
        quantity: item.quantity,
        price_at_purchase: { $numberDecimal: item.price_at_purchase.toString() },
      }));
    
      await orderItemsCollection.insertMany(orderItems);
    
      return res.status(201).json({ order: { ...newOrder, _id: orderId } });
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

    } 
    else if (type === 'createConsultingSession') {
      const {
        session_date,
        session_type,
        design_focus,
        property_type,
        duration,
        client_requirements,
        status,
      } = req.body;
    
      const sessionsCollection = database.collection("consulting_sessions");
    
      try {
        // Validate required fields
        if (!session_date || !session_type || !status) {
          throw new Error("Missing required fields: session_date, session_type, or status");
        }
    
        // Default designer_id (Admin)
        const defaultDesignerId = new ObjectId("67fcfa22ee72f858ad940af6");
    
        // Create the consulting session
        const newSession = {
          session_date: new Date(session_date),
          session_type,
          design_focus: design_focus || null,
          property_type: property_type || null,
          duration: duration || null,
          client_requirements: client_requirements || {},
          status,
          designer_id: defaultDesignerId, // Set default designer_id
          created_at: new Date(),
          updated_at: new Date(),
        };
    
        const result = await sessionsCollection.insertOne(newSession);
    
        return res.status(201).json({
          success: true,
          session: { ...newSession, _id: result.insertedId },
        });
      } catch (error) {
        console.error("Error creating consulting session:", error);
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }
    }
    else if (type === 'mergeCarts') {
      const { userId, localCartItems } = req.body;
    
      if (!userId || !localCartItems) {
        return res.status(400).json({ error: 'User ID and local cart items are required' });
      }
    
      const cartsCollection = database.collection("cart");
      const cartItemsCollection = database.collection("cart_items");
    
      try {
        // Find or create the user's cart
        let cart = await cartsCollection.findOne({ user_id: new ObjectId(userId) });
        if (!cart) {
          const result = await cartsCollection.insertOne({
            user_id: new ObjectId(userId),
            created_at: new Date(),
          });
          cart = { _id: result.insertedId };
        }
    
        // Merge local cart items with database cart items
        const dbCartItems = await cartItemsCollection.find({ cart_id: cart._id }).toArray();
        const mergedCartItems = [...dbCartItems];
    
        localCartItems.forEach(localItem => {
          const existingItem = mergedCartItems.find(item => item.product_id.equals(localItem.productId));
          if (existingItem) {
            existingItem.quantity += localItem.quantity;
          } else {
            mergedCartItems.push({
              cart_id: cart._id,
              product_id: new ObjectId(localItem.productId),
              quantity: localItem.quantity,
            });
          }
        });
    
        // Update the cart_items collection
        await cartItemsCollection.deleteMany({ cart_id: cart._id }); // Clear existing items
        await cartItemsCollection.insertMany(mergedCartItems.map(item => ({
          cart_id: cart._id,
          product_id: item.product_id,
          quantity: item.quantity,
        })));
    
        return res.status(200).json({ success: true, cart: mergedCartItems });
      } catch (error) {
        console.error("Error merging carts:", error);
        return res.status(500).json({ error: 'Failed to merge carts' });
      }
    }
    else if (type === 'saveCart') {
      const { userId, cartItems } = req.body;
  
      if (!userId || !cartItems) {
          return res.status(400).json({ error: 'User ID and cart items are required' });
      }
  
      // Validate cartItems structure
      if (!Array.isArray(cartItems)) {
          return res.status(400).json({ error: 'cartItems must be an array' });
      }
  
      for (const item of cartItems) {
          if (!item.productId || !item.quantity) {
              return res.status(400).json({ 
                  error: 'Each cart item must have productId and quantity',
                  invalidItem: item
              });
          }
      }
  
      const cartsCollection = database.collection("cart");
      const cartItemsCollection = database.collection("cart_items");
  
      try {
          // Convert userId to ObjectId first to validate it
          const userIdObject = new ObjectId(userId);
          
          // Find or create the user's cart
          let cart = await cartsCollection.findOne({ user_id: userIdObject });
          
          if (!cart) {
              const result = await cartsCollection.insertOne({
                  user_id: userIdObject,
                  created_at: new Date(),
                  updated_at: new Date()
              });
              cart = { _id: result.insertedId };
          } else {
              // Update the updated_at timestamp
              await cartsCollection.updateOne(
                  { _id: cart._id },
                  { $set: { updated_at: new Date() } }
              );
          }
  
          // Format cart items with additional validation
          const formattedCartItems = cartItems.map(item => {
              try {
                  return {
                      cart_id: cart._id,
                      product_id: new ObjectId(item.productId),
                      quantity: parseInt(item.quantity), // Ensure quantity is a number
                      added_at: new Date()
                  };
              } catch (e) {
                  throw new Error(`Invalid productId format for item: ${JSON.stringify(item)}`);
              }
          });
  
          // Update the cart_items collection more efficiently
          const bulkOps = [
              { deleteMany: { filter: { cart_id: cart._id } } // Clear existing items
      }].concat(
              formattedCartItems.map(item => ({
                  insertOne: { document: item }
              }))
          );
  
          await cartItemsCollection.bulkWrite(bulkOps);
  
          // Return the updated cart for frontend synchronization
          const updatedCartItems = await cartItemsCollection.find({ cart_id: cart._id }).toArray();
          
          return res.status(200).json({ 
              success: true, 
              message: 'Cart saved successfully',
              cart: {
                  _id: cart._id,
                  user_id: userId,
                  items: updatedCartItems.map(item => ({
                      _id: item.product_id, // This matches frontend expectation
                      quantity: item.quantity
                  }))
              }
          });
      } catch (error) {
          console.error("Error saving cart:", error);
          
          // More specific error messages
          if (error.message.includes('ObjectId')) {
              return res.status(400).json({ 
                  error: 'Invalid ID format',
                  details: error.message 
              });
          }
          
          return res.status(500).json({ 
              error: 'Failed to save cart',
              details: error.message 
          });
      }
  }
    else if (type === 'categoriesAndProducts') {
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

    }// Add these to your existing if-else conditions in connectDB.js

    else if (type === 'adminOrders') {
      const ordersCollection = database.collection("orders");
      const orders = await ordersCollection.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json({ orders });
    }

    else if (type === 'adminProducts') {
      const productsCollection = database.collection("products");
      const products = await productsCollection.find({}).toArray();
      return res.status(200).json({ products });
    }

    else if (type === 'updateOrderStatus') {
      const { orderId, status } = req.body;
      const ordersCollection = database.collection("orders");

      await ordersCollection.updateOne(
        { _id: new ObjectId(orderId) },
        { $set: { status } }
      );

      return res.status(200).json({ message: "Order status updated" });
    }

    else if (type === 'updateProduct') {
      const { product } = req.body;
      const productsCollection = database.collection("products");

      await productsCollection.updateOne(
        { _id: new ObjectId(product._id) },
        { $set: product }
      );

      return res.status(200).json({ message: "Product updated" });
    }

    else if (type === 'createProduct') {
      const { product } = req.body;
      const productsCollection = database.collection("products");

      // Convert price to Decimal128
      const newProduct = {
        ...product,
        price: { $numberDecimal: parseFloat(product.price).toFixed(2) },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await productsCollection.insertOne(newProduct);
      newProduct._id = result.insertedId;

      return res.status(201).json(newProduct);
    }

    else if (type === 'deleteProduct') {
      const { productId } = req.body;
      const productsCollection = database.collection("products");

      await productsCollection.deleteOne({ _id: new ObjectId(productId) });

      return res.status(200).json({ message: "Product deleted" });
    } // Add these to your existing if-else conditions in connectDB.js

    else if (type === 'adminMedia') {
      const mediaCollection = database.collection("product_media");
      const media = await mediaCollection.find({}).toArray();
      return res.status(200).json({ media });
    }

    else if (type === 'adminAvailability') {
      const availabilityCollection = database.collection("consulting_availability");
      const availability = await availabilityCollection.find({}).toArray();
      return res.status(200).json({ availability });
    }

    else if (type === 'addProductMedia') {
      const { media } = req.body;
      const mediaCollection = database.collection("product_media");

      try {
        console.log("Received media data:", media);

        // Validate required fields
        if (!media || !media.product_id || !media.file_path || !media.media_type) {
          throw new Error("Product ID, file path, and media type are required");
        }

        // Validate product exists
        const productExists = await database.collection("products").findOne({
          _id: new ObjectId(media.product_id),
        });

        if (!productExists) {
          throw new Error("Product not found");
        }

        // Validate file path format
        if (!media.file_path.startsWith('/models/') && !media.file_path.startsWith('/images/')) {
          throw new Error("File path must start with /models/ or /images/");
        }

        // Validate media type
        const allowedTypes = ['image', 'video', '3d_model'];
        if (!allowedTypes.includes(media.media_type)) {
          throw new Error(`Invalid media type. Allowed: ${allowedTypes.join(', ')}`);
        }

        const newMedia = {
          product_id: new ObjectId(media.product_id),
          media_type: media.media_type,
          file_path: media.file_path,
          is_primary: media.is_primary || false,
          created_at: new Date(),
          updated_at: new Date(),
        };

        const result = await mediaCollection.insertOne(newMedia);
        newMedia._id = result.insertedId;

        return res.status(201).json({
          success: true,
          media: newMedia,
        });
      } catch (error) {
        console.error("Error adding media:", error);
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }
    }

    else if (type === 'deleteMedia') {
      const { mediaId } = req.body;
      const mediaCollection = database.collection("product_media");

      await mediaCollection.deleteOne({ _id: new ObjectId(mediaId) });

      return res.status(200).json({ message: "Media deleted" });
    }

    else if (type === 'addAvailability') {
      const { availability } = req.body;
      const availabilityCollection = database.collection("consulting_availability");

      try {
        console.log("Received availability data:", JSON.stringify(availability, null, 2));

        if (!availability) {
          throw new Error("No availability data received");
        }

        // Validate date
        if (!availability.date) {
          throw new Error("Date is required");
        }
        const dateObj = new Date(availability.date);
        if (isNaN(dateObj.getTime())) {
          throw new Error(`Invalid date format: ${availability.date}`);
        }

        // Validate time slots
        if (!availability.time_slots || !Array.isArray(availability.time_slots)) {
          throw new Error("time_slots must be an array");
        }

        const validatedSlots = availability.time_slots.map(slot => {
          if (!slot.time || !slot.available || !slot.capacity) {
            throw new Error(`Missing required fields in time slot: ${JSON.stringify(slot)}`);
          }
          return {
            time: slot.time,
            available: parseInt(slot.available),
            capacity: parseInt(slot.capacity)
          };
        });

        const result = await availabilityCollection.insertOne({
          date: dateObj,
          time_slots: validatedSlots,
          updated_at: new Date()
        });

        console.log("Insert result:", result);
        return res.status(201).json({
          success: true,
          insertedId: result.insertedId
        });

      } catch (error) {
        console.error("Detailed error:", {
          message: error.message,
          stack: error.stack,
          receivedData: availability
        });
        return res.status(400).json({
          success: false,
          error: error.message,
          details: error.stack
        });
      }
    }

    else if (type === 'deleteAvailability') {
      const { availabilityId } = req.body;
      const availabilityCollection = database.collection("consulting_availability");

      try {
        console.log("Delete request received for availability ID:", availabilityId);

        // Validate input
        if (!availabilityId || typeof availabilityId !== 'string') {
          throw new Error("Valid availability ID is required");
        }

        // Validate ObjectId format
        if (!ObjectId.isValid(availabilityId)) {
          throw new Error("Invalid availability ID format");
        }

        const objectId = new ObjectId(availabilityId);

        // First check if document exists
        const existingDoc = await availabilityCollection.findOne({ _id: objectId });
        if (!existingDoc) {
          throw new Error(`Availability with ID ${availabilityId} not found`);
        }

        // Perform deletion
        const result = await availabilityCollection.deleteOne({ _id: objectId });

        // Verify deletion
        if (result.deletedCount !== 1) {
          throw new Error(`Failed to delete availability (deletedCount: ${result.deletedCount})`);
        }

        console.log("Successfully deleted availability:", {
          id: availabilityId,
          date: existingDoc.date,
          time_slots: existingDoc.time_slots.length
        });

        return res.status(200).json({
          success: true,
          deletedCount: result.deletedCount,
          deletedId: availabilityId,
          message: "Availability successfully deleted"
        });

      } catch (error) {
        console.error("Delete availability error:", {
          error: error.message,
          stack: error.stack,
          receivedId: availabilityId,
          timestamp: new Date().toISOString()
        });

        return res.status(400).json({
          success: false,
          error: error.message,
          receivedId: availabilityId,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
    }
    else {
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