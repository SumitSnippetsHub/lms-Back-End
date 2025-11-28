import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { config } from 'dotenv';
import morgan from 'morgan';
config();

const app = express();

app.use(express.json());

// app.use(cors({
//     origin: []
// }));

// app.use(cookieParser());

app.use(morgan('dev'));

app.use('/ping', (req, res) => {
    res.send('pong');
})

// app.use((req, res) => {
//     console.log("new request here")
// })

// 3 modules routes

app.use((req, res) => {
    res.status(404).send("OOPS!! Page not found");
});

export default app;