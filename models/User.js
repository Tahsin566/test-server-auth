import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String
})

export const User = mongoose.model('clients',UserSchema)