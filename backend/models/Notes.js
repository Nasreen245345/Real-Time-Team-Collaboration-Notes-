const mongoose=require("mongoose")
const notesSchema=new mongoose.Schema(
{ 
//   user_id: { type: mongoose.Schema.Types.ObjectId,ref:'User', auto: true },
workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true }, 
title: { type: String, default: 'Untitled' }, 
content: { type: String, default: '' }, 
lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
lastEditedAt: { type: Date, default: Date.now }, 
createdAt: { type: Date, default: Date.now } 
}
)
notesSchema.index({workspaceId:1,lastEditedAt:-1})
module.exports=mongoose.model("notes",notesSchema)