import express from "express"
const app = express();
import cookieParser from "cookie-parser";
import cors from "cors";
import {userRouter} from "./routes/user.routes.js";

app.use(cors({
    origin:process.env.CROSS_ORIGIN,
    credentials:true
}));
app.use(express.urlencoded({extended:true})); // extented for recieving nested objetcs
app.use(express.json());
app.use(express.static("public")) // storing something on public folder in server
app.use(cookieParser());

app.use("/api/v1/user",userRouter)


export {app}