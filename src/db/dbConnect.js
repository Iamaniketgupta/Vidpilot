import mongoose from "mongoose";
const MONGODB_URL =process.env.MONGODB_URL;

const dbConnect = async () => {
    try {
        await mongoose.connect(MONGODB_URL)
        // await mongoose.connect("mongodb+srv://aniketgupta:aniketgupta1234@vidpilot.7blwke9.mongodb.net/?retryWrites=true&w=majority&appName=vidpilot/vidpilot")
            .then(() => console.log("connected to mongo db"))
    }catch(err){
        console.log("Error From ConnectDB: " ,err)
    }

}

export default dbConnect;