import express from "express"
import router from "./routes";
import cookieParser from 'cookie-parser';

const app = express()

app.use('/v1',
  express.json({ limit: '16kb' }),
  express.urlencoded({ extended: true, limit: '20kb' }),
  cookieParser(),
  router);

export { app }