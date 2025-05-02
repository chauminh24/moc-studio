import { MongoClient } from "mongodb";

async function run() {
  const uri = "mongodb+srv://chomin2401:matkhaucuachau@moc-studio.f7so7.mongodb.net/?retryWrites=true&w=majority&appName=moc-studio";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("moc-studio");


    // // Drop old collections
    // await db.collection("orders").drop().catch(() => { });
    // await db.collection("order_items").drop().catch(() => { });

    // Create new orders collection
    await db.createCollection("orders", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["user_id", "total_price", "order_status", "placed_at"],
          properties: {
            user_id: { bsonType: ["objectId", "null"] },
            total_price: { bsonType: "decimal" },
            order_status: { enum: ["pending", "completed", "shipped", "canceled"] },
            shipping_address: {
              bsonType: "object",
              required: ["address", "city", "postalCode", "country", "firstName", "lastName", "email"],
              properties: {
                address: { bsonType: "string" },
                city: { bsonType: "string" },
                postalCode: { bsonType: "string" },
                country: { bsonType: "string" },
                firstName: { bsonType: "string" },
                lastName: { bsonType: "string" },
                email: { bsonType: "string" },
                phone: { bsonType: "string" },
              }
            },
            shipping_method: { bsonType: "string" },
            payment_method: { bsonType: "string" },
            placed_at: { bsonType: "date" },
            estimated_delivery: { bsonType: "date" },
            tracking_number: { bsonType: "string" }
          }
        }
      }
    });

    // Create new order_items collection
    await db.createCollection("order_items", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["order_id", "product_id", "quantity", "price_at_purchase"],
          properties: {
            order_id: { bsonType: "objectId" },
            product_id: { bsonType: "objectId" },
            quantity: { bsonType: "int" },
            price_at_purchase: { bsonType: "decimal" }
          }
        }
      }
    });

    console.log("Collections recreated successfully!");
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
//     await db.createCollection("product_media", {
//       validator: {
//         $jsonSchema: {
//           bsonType: "object",
//           required: ["product_id", "media_type", "file_path"],
//           properties: {
//             product_id: { bsonType: "objectId", description: "Reference to the product document" },
//             media_type: { enum: ["image", "video", "3d_model"], description: "Type of media" },
//             file_path: { bsonType: "string", description: "Relative path to the file" },
//             is_primary: { bsonType: "bool", description: "Primary media flag" },
//             created_at: { bsonType: "date", description: "Creation date" },
//             updated_at: { bsonType: "date", description: "Last update date" },
//           },
//         },
//       },
//     });

//     console.log("Collection created successfully!");
//   } finally {
//     await client.close();
//   }
// }

// run().catch(console.dir);