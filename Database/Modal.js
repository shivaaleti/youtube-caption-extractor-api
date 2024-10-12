import mongoose from "./Config.js";

const ipsSchema = mongoose.Schema({
   details:Object
})

const ips = new mongoose.model("ips",ipsSchema)

export {ips};