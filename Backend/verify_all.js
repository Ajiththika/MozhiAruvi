import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(async () => {
    console.log("Connected to MongoDB.");
    const db = mongoose.connection.db;
    const result = await db.collection('users').updateMany(
      { isEmailVerified: false },
      { $set: { isEmailVerified: true }, $unset: { verificationToken: "", verificationTokenExpires: "" } }
    );
    console.log(`Successfully verified ${result.modifiedCount} users.`);
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection error:", err);
    process.exit(1);
  });
