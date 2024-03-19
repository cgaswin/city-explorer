import mongoose, { Mongoose } from 'mongoose';

const DB_URI: string = process.env.DB_URI || '';

const connectWithDB = async (): Promise<Mongoose> => {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connection to DB successful');
    return mongoose;
  } catch (error) {
    console.error('DB connection failed');
    console.log(error);
    process.exit(1);
  }
};

export default connectWithDB;
