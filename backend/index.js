import 'dotenv/config'
import mongoDBConnect from './mongodb/connection.js';
import express from 'express';
import userRoutes from './routes/user.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as Server from 'socket.io';
import mongoose from "mongoose"
const PORT = process.env.PORT || 8000

import adminRoutes from './routes/admin.js';

mongoose.set('strictQuery', false);
mongoDBConnect();

const allowed_origins =   [
  'http://localhost:5173',
  "https://abhishekcreations.com",
  "https://main.d1uy8jdq91e99t.amplifyapp.com"
]





const app = express();
const corsConfig = {
  origin: allowed_origins,
  //origin: '*',
  credentials: true,
  methods:["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

const createLog = (req, res, next) => {
  res.on("finish", function() {
    console.log(req.method,req.body, decodeURI(req.url), res.statusCode, res.statusMessage);
  });
  next();
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(createLog)




//app.use(limiter)
//xapp.options("*",cors(corsConfig))
app.use(cors(corsConfig));
app.use('/', userRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: "hi humans" });
});

app.get('/x-forwarded-for', (request, response) => response.send(request.headers['x-forwarded-for']))

app.set('trust proxy', 1)
app.get('/ip', (request, response) => response.send(request.ip))

const server = app.listen(PORT, () => {
  console.log(`Server Listening at PORT - ${PORT}`);
});





function get_time(){
	let d = new Date()
	let t = d.getTime()/1000
	// delta is the correction parameter
	return t
}
//simulate delay
// io.use((socket, next) => {
//   // Delay in milliseconds (adjust as needed)
//   const delay = 500; // 2 seconds delay
  
//   // Simulate delay before proceeding
//   setTimeout(() => {
//     next();
//   }, delay);
// });

