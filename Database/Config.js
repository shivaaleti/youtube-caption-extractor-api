import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();


const URL = process.env.MONGO_URL;

mongoose.connect(URL).then(()=>{
console.log("Database connected")
}).catch((error)=>{
    console.log("Error while connecting database: ",error)
})

export default mongoose;