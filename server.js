
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';

import postRoutes from './routes/posts.js';
import userRouter from "./routes/user.js";

import dotenv from 'dotenv';
const __dirname = path.resolve();
dotenv.config({path:"./.env"});

const app = express();

app.use(express.json({ limit: '30mb', extended: true }))
app.use(express.urlencoded({ limit: '30mb', extended: true }))
app.use(cors());

app.use('/posts', postRoutes);
app.use("/user", userRouter);

const MONGO_URI_B = 'mongodb+srv://project3:project3@cluster0.lnpak.mongodb.net/database_B?retryWrites=true&w=majority';
const PORT = process.env.PORT|| 5000;

if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname, '/client/build')));
  app.get('*', (req, res)=>{
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  })
}else{
 app.get('/', (req, res)=>{
   res.send('API is running');
 })
}

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })  // *** Local to remote 1
  .then(() => app.listen(PORT, () => console.log(`Server Running on Port: http://localhost:${PORT}`)))
  .catch((error) => console.log(`${error} did not connect`));

mongoose.set('useFindAndModify', false);