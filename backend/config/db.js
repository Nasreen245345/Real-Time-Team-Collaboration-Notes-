const mongoose=require("mongoose")
require("dotenv").config()
const ConnectDB=async()=>{
    try{
       await  mongoose.connect(process.env.MONGODB_URI)
       console.log("MongoDB connected Succesfully")
    }catch(error){
        console.log("mongodb connection error",error.message)
        process.exit(1)
    }
}
module.exports=ConnectDB