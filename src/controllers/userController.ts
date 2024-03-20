import User, { IUser } from '../models/user.js';
import { ApiError } from '../utils/ApiError.js';
import cookieToken from '../utils/cookieToken.js';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import axios from 'axios';
import { ENV_VARIABLE_NOT_FOUND_ERROR_CODE, ENV_VARIABLE_NOT_FOUND_ERROR_MESSAGE } from '../utils/errorCodes.js';

const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

const recommendationsSchema = z.object({
  preferences: z.array(z.string()).optional(),
  ip: z.string(),
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

export const getRecommendation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedInput = recommendationsSchema.safeParse(req.body);
    if (!parsedInput.success) {
      throw new ApiError(400, parsedInput.error.message);
    }
    const { ip } = parsedInput.data;

    const weatherData = await fetchWeatherData(ip);

    const { wind_mph, precip_mm, humidity, feelslike_c } = weatherData;

    let activity;

    if (precip_mm > 0) {
      activity = "It's raining, how about reading a book or watching a movie at home?";
    } else if (feelslike_c < 10) {
      activity = "It's quite cold outside, how about going to a museum or a coffee shop?";
    } else if (feelslike_c > 30) {
      activity = "It's hot outside, how about going to a swimming pool or staying in an air-conditioned room?";
    } else if (humidity > 80) {
      activity = "It's quite humid, how about indoor activities like going to a gym or a shopping mall?";
    } else if (wind_mph > 20) {
      activity = "It's windy, how about flying a kite or going for a drive?";
    } else {
      activity = 'The weather is nice, how about outdoor activities like hiking or cycling?';
    }
    res.status(201).json({
      data: {
        activity,
      },
    });
  } catch (error) {
    next(error);
  }
};

async function fetchWeatherData(ip: string) {
  const baseUrl = `http://api.weatherapi.com/v1`;
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    throw new ApiError(ENV_VARIABLE_NOT_FOUND_ERROR_CODE, ENV_VARIABLE_NOT_FOUND_ERROR_MESSAGE);
  }
  const response = await axios.get(`${baseUrl}/current.json`, {
    params: {
      key: apiKey,
      q: ip,
    },
  });

  const { lat, lon } = response.data.location;

  const weatherResponse = await axios.get(`${baseUrl}/current.json`, {
    params: {
      key: apiKey,
      q: `${lat},${lon}`, // passing latitude and longitude
    },
  });
  const {
    wind_mph,
    wind_kph,
    wind_degree,
    wind_dir,
    pressure_mb,
    pressure_in,
    precip_mm,
    precip_in,
    humidity,
    cloud,
    feelslike_c,
    feelslike_f,
  } = weatherResponse.data.current;

  return {
    wind_mph,
    wind_kph,
    wind_degree,
    wind_dir,
    pressure_mb,
    pressure_in,
    precip_mm,
    precip_in,
    humidity,
    cloud,
    feelslike_c,
    feelslike_f,
  };
}
