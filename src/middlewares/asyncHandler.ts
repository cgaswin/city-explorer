import { Request, Response, NextFunction } from 'express';

type requestHandler = (req: Request, res: Response, next: NextFunction) => Promise<object>;

const asyncHandler = (fn: requestHandler) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    return await Promise.resolve(fn(req, res, next));
  } catch (error) {
    return next(error);
  }
};

export default asyncHandler;
