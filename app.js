import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { config } from 'dotenv';
import morgan from 'morgan';
import { errorMiddleware } from './middlewares/error.middleware.js';
import userRouter from './routes/user.routes.js';
import courseRouter from './routes/course.routes.js';
import paymentRouter from './routes/payment.routes.js';
config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(cors({
//     origin: []
// }));

app.use(cookieParser());

app.use(morgan('dev'));

app.use('/ping', (req, res) => {
    res.send('pong');
})

// app.use((req, res) => {
//     console.log("new request here")
// })

// 3 modules routes

app.use('/api/v1/user', userRouter);
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/payments', paymentRouter);

app.use((req, res) => {
    res.status(404).send("OOPS!! Page not found");
});

app.use(errorMiddleware);

export default app;