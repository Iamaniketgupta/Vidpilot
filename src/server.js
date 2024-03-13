import 'dotenv/config';
import  dbConnect  from "./db/dbConnect.js";
import { app } from './app.js';
const PORT = process.env.PORT || 8000;




dbConnect()
.then(()=>app.listen(PORT, () => console.log("listening at 8000"))
).catch(()=>console.log("Error in connection of databse"));


