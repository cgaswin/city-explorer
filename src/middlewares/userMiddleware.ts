import User, { IUser } from '../models/user.js';
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';

interface RequestWithUser extends Request {
  user: IUser;
}

export const isLoggedIn = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const typedReq = req as RequestWithUser;
  const token: string | undefined = typedReq.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return next(new ApiError(401, 'Please login to continue'));
  }

  try {
    const JWT_SECRET: string | undefined = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return next(new ApiError(500, 'Internal Server Error'));
    }
    const decoded: JwtPayload | undefined = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded || !decoded.id) {
      return next(new ApiError(401, 'Invalid token'));
    }

    User.findById(decoded.id)
      .then((user) => {
        if (!user) {
          return next(new ApiError(404, 'User not found'));
        }

        typedReq.user = user; // Assign user property to typedReq
        next(); // Call next to proceed to the next middleware
      })
      .catch((err) => {
        console.log(err);
        return next(new ApiError(401, 'Invalid token'));
      });
  } catch (err) {
    console.log(err);
    return next(new ApiError(401, 'Invalid token'));
  }
};
