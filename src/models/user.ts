import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { ApiError } from '../utils/ApiError.js';
import { ENV_VARIABLE_NOT_FOUND_ERROR_CODE, ENV_VARIABLE_NOT_FOUND_ERROR_MESSAGE } from '../utils/errorCodes.js';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  preferences: [string];
  recommendations: [string];
  validatePassword: (userSendPassword: string) => boolean;
  createJwtToken: () => Promise<string>;
}

const userModel = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      MaxLength: [40, 'name should be under 40 characters'],
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      validate: [validator.isEmail, 'incorrect format for email'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'password is required'],
      minlength: [6, 'password should not be less than 6 character'],
      select: false,
    },
    preferences: [String],
    recommendations: [String],
  },
  { timestamps: true },
);

//encrypt before save
userModel.pre('save', async function (next: (err?: Error) => void) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

//validate the password with passed on user password

userModel.methods.validatePassword = async function (userSendPassword: string): Promise<boolean> {
  return await bcrypt.compare(userSendPassword, this.password);
};

//create jwt token
userModel.methods.createJwtToken = async function (): Promise<string> {
  const jwtSecret: string = process.env.JWT_SECRET!;
  const jwtExpiry: string = process.env.JWT_EXPIRY!;
  if (!jwtSecret || !jwtExpiry) {
    throw new ApiError(ENV_VARIABLE_NOT_FOUND_ERROR_CODE, ENV_VARIABLE_NOT_FOUND_ERROR_MESSAGE);
  }
  return jwt.sign({ id: this._id }, jwtSecret, { expiresIn: jwtExpiry });
};

const User = mongoose.model<IUser>('User', userModel);
export default User;
