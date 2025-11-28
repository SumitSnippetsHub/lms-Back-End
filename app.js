import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { config } from 'dotenv';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js'
import { errorMiddleware } from './middlewares/error.middleware.js';
config();

const app = express();
app.use(express.json());

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

app.use('/api/v1/user', userRoutes);

app.use((req, res) => {
    res.status(404).send("OOPS!! Page not found");
});

app.use(errorMiddleware);

export default app;