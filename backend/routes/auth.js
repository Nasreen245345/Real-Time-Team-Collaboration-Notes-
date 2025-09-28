const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const express=require("express")
const User=require("../models/User.js")
const router=express.Router()
require("dotenv").config()
//signup route
router.post('/signup',async(req,res)=>{
    const {name,email,password}=req.body
    try{
        const existingUser=await User.findOne({email})
        if(existingUser){
            return res.status(400).json({message:"User with this email already exist"})
        }
        const newUser=new User({name,email,password})
        await newUser.save()
        return res.status(201).json({message:'signup succesfully'})

    }catch(error){
        return res.status(500).json({message:"Server error",error:error.message})
    }
})
//login route
router.post("/login",async (req,res)=>{
    const {email,password}=req.body
    try{
        const user=await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"Invalid credential"})
        }
        
        const isMatch=await bcrypt.compare(password,user.password)
        
        if(!isMatch){
            return res.status(400).json({message:"Inavlid credential"})
        }
        const token=jwt.sign({id:user._id,email:user.email},process.env.JWT_SECRET,{expiresIn:"1d"})
        return res.json({token,user:{id:user._id,email:user.email},message:"Login successful"})
    }catch(error){
        return res.status(500).json({message:"Server error"})
    }
})
module.exports=router