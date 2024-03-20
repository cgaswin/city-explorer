import User, { IUser } from '../models/user.js';
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';

interface RequestWithUser extends Request {
  user: IUser;
}

export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  const typedReq = req as RequestWithUser;
  let token = req.cookies.token;

  const authHeader = typedReq.header('Authorization');
  if (!token && authHeader) {
    token = authHeader.replace('Bearer ', '');
  }

  if (!token && !authHeader) {
    return next(new ApiError(401, 'Unauthorized'));
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

        typedReq.user = user;
        next();
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
