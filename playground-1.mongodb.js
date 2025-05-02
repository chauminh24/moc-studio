// First: drop the old collections (ONLY if you're sure, no important data inside!)

db.orders.drop();
db.order_items.drop();

// Then: recreate them with corrected validators

// Create 'orders' collection
db.createCollection("orders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "total_price", "order_status", "placed_at"],
      properties: {
        user_id: { bsonType: ["objectId", "null"] }, // allow guest checkout (nullable)
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
            phone: { bsonType: "string" } // optional phone
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

// Create 'order_items' collection
db.createCollection("order_items", {
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
