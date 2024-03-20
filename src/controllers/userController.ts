import User, { IUser } from '../models/user.js';
import { ApiError } from '../utils/ApiError.js';
import cookieToken from '../utils/cookieToken.js';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginUserSchema = userSchema.omit({ name: true });

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedInput = userSchema.safeParse(req.body);
    if (!parsedInput.success) {
      throw new ApiError(400, parsedInput.error.message);
    }
    const { name, email, password } = parsedInput.data;
    const user = await User.create({ name, email, password });
    cookieToken(user, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedInput = loginUserSchema.safeParse(req.body);
    if (!parsedInput.success) {
      throw new ApiError(400, parsedInput.error.message);
    }
    const { email, password } = parsedInput.data;
    const user: IUser = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isPasswordCorrect: boolean = await user.validatePassword(password);

    if (!isPasswordCorrect) {
      throw new ApiError(401, 'Invalid credentials');
    }

    cookieToken(user, res);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.cookie('token', null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};
