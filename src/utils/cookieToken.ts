import { Response } from 'express';
import { ApiError } from './ApiError.js';
import { IUser } from '../models/user.js';
import { ENV_VARIABLE_NOT_FOUND_ERROR_CODE, ENV_VARIABLE_NOT_FOUND_ERROR_MESSAGE } from './errorCodes.js';

const cookieToken = async (user: IUser, res: Response) => {
  const token: string = await user.createJwtToken();
  const { name, email } = user;

  const userDetails = {
    email,
    name,
    user_id: user._id,
  };

  const COOKIE_TIME: number | undefined = process.env.COOKIE_TIME ? parseInt(process.env.COOKIE_TIME) : undefined;
  if (!COOKIE_TIME) {
    throw new ApiError(ENV_VARIABLE_NOT_FOUND_ERROR_CODE, ENV_VARIABLE_NOT_FOUND_ERROR_MESSAGE);
  }
  const options = {
    expires: new Date(Date.now() + COOKIE_TIME * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(200).cookie('token', token, options).json({
    success: true,
    data: userDetails,
  });
};

export default cookieToken;
