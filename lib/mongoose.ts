import mongoose from "mongoose";

let isConnected = false; // variable to check if we are connected
export const connectToDB = async () => {
  // ? Dalam konteks ini, "strictQuery" mengacu pada mode di mana Mongoose akan menjadi lebih ketat dalam memvalidasi dan memeriksa kueri (query) yang Anda kirimkan ke MongoDB. Ketika mode "strictQuery" diaktifkan dengan nilai true, Mongoose akan memeriksa kueri yang Anda buat untuk memastikan bahwa mereka sesuai dengan skema (schema) yang telah Anda tetapkan untuk model data MongoDB Anda.
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URL) return console.log("Missing MongoDB URL");

  // ? Jika koneksi sudah dibuat, kembalilah tanpa membuat koneksi baru.
  if (isConnected) {
    console.log("MongoDB connection already established");
    return;
  }
  console.log(process.env.MONGODB_URL);
  try {
    // ? mengconectkan ke server mongoose
    await mongoose.connect(process.env.MONGODB_URL);
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
};
