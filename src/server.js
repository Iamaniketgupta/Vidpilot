import 'dotenv/config';

import express from "express"
const app = express();
import  dbConnect  from "./db/dbConnect.js";
import cookieParser from "cookie-parser";
import cors from "cors";
const PORT = process.env.PORT || 8000;

app.use(cors({
    origin:process.env.CROSS_ORIGIN,
    credentials:true
}));
app.use(express.urlencoded({extended:true})); // extented for recieving nested objetcs
app.use(express.static("public")) // storing something on public folder in server
app.use(cookieParser);



dbConnect()
.then(()=>app.listen(PORT, () => console.log("listening at 8000"))
).catch(()=>console.log("Error in connection of databse"));


