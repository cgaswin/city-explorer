import dotenv from 'dotenv';
import express, { type Application } from 'express';
import cors, { type CorsOptions } from 'cors';
import helmet from 'helmet';
import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit';
import morgan from 'morgan';

dotenv.config();

const app: Application = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  } as CorsOptions),
);

app.use(helmet());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(morgan('dev'));

const limiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, //15 mins
  limit: 100,
  legacyHeaders: false,
  message: 'Too many requests from this ip, please try after 15 mins',
});

app.use('/api', limiter);

export default app;
