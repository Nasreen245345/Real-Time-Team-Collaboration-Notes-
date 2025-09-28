const mongoose=require("mongoose")
const workspaceSchema=new mongoose.Schema(
{ 
user_id: { type: mongoose.Schema.Types.ObjectId,ref:'User', auto: true }, 
name: { 
    type: String, 
    required: true 
}, 
description: { 
    type: String 
}, 
members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
createdAt: { type: Date, default: Date.now } 
}
)
workspaceSchema.index({members:1})
module.exports=mongoose.model('workspace',workspaceSchema)