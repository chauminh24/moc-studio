import { MongoClient, ObjectId } from 'mongodb';

const uri = "mongodb+srv://chomin2401:matkhaucuachau@moc-studio.f7so7.mongodb.net/?retryWrites=true&w=majority&appName=moc-studio";

export default async function handler(req, res) {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db("moc-studio");

    switch (req.method) {
      case 'GET':
        // Handle availability checks
        if (req.query.type === 'dates') {
          return handleGetAvailableDates(req, res, db);
        } else if (req.query.type === 'times') {
          return handleGetAvailableTimes(req, res, db);
        }
        break;
      
      case 'POST':
        // Handle new booking
        return handleCreateBooking(req, res, db);
      
      default:
        res.status(405).json({ message: 'Method not allowed' });
    }
  } finally {
    await client.close();
  }
}

// Helper functions
async function handleGetAvailableDates(req, res, db) {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const dates = await db.collection("consulting_availability")
    .find({
      date: { $gte: new Date(), $lte: thirtyDaysFromNow },
      available_slots: { $gt: 0 }
    })
    .project({ date: 1 })
    .toArray();
  
  res.status(200).json(dates.map(d => d.date.toISOString().split('T')[0]));
}

async function handleGetAvailableTimes(req, res, db) {
  const { date } = req.query;
  const availability = await db.collection("consulting_availability")
    .findOne({ date: new Date(date) });
  
  if (!availability) {
    return res.status(404).json({ message: 'No availability for this date' });
  }
  
  res.status(200).json(availability.time_slots.filter(t => t.available > 0).map(t => t.time));
}

async function handleCreateBooking(req, res, db) {
  const { date, time, userInfo, projectDetails } = req.body;
  const session = client.startSession();
  
  try {
    await session.withTransaction(async () => {
      // 1. Check and update availability
      const updateResult = await db.collection("consulting_availability")
        .updateOne(
          { 
            date: new Date(date),
            "time_slots.time": time,
            "time_slots.available": { $gt: 0 }
          },
          { $inc: { "time_slots.$.available": -1 } },
          { session }
        );
      
      if (updateResult.modifiedCount === 0) {
        throw new Error('Time slot no longer available');
      }
      
      // 2. Create consulting session
      const sessionData = {
        session_id: new ObjectId(),
        user_id: new ObjectId(userInfo.userId), // You'll need to get this from auth
        designer_id: null, // To be assigned later
        session_date: new Date(`${date}T${time}:00`),
        session_type: "virtual",
        design_focus: projectDetails.designFocus,
        property_type: projectDetails.propertyType,
        duration: 60,
        status: "booked",
        notes: projectDetails.additionalNotes,
        created_at: new Date()
      };
      
      await db.collection("consulting_session").insertOne(sessionData, { session });
      
      // 3. Create payment record (initial unpaid status)
      await db.collection("session_payment").insertOne({
        payment_id: new ObjectId(),
        session_id: sessionData.session_id,
        user_id: sessionData.user_id,
        amount_paid: 0,
        payment_method: null,
        payment_date: null,
        status: "pending"
      }, { session });
    });
    
    res.status(201).json({ success: true });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    await session.endSession();
  }
}