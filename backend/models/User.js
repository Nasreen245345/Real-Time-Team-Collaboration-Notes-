const mongoose=require("mongoose")
const bcrypt=require("bcrypt")
const userSchema=new mongoose.Schema({
name:{
type:String,
required:true,
},
email:{
    type:String,
    lowercase:true,
    required:true,
    unique:true
},
password:{
    type:String,
    required:true,
    minlength:6

}
},
{
    timestamps:true
})
userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next()
    this.password=await bcrypt.hash(this.password,12)
next()   
})
module.exports=mongoose.model("users",userSchema)
