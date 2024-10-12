import mongoose from "./Config.js";

const ipsSchema = mongoose.Schema({
    ip:String
})

const ips = new mongoose.model("ips",ipsSchema)

export {ips};