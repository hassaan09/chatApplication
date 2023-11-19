const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
    {
        //id will be auto generated in mongodb
        name: {type:String,unique:true,required:true,min:4,max:20},
        email:{type:String,required:true},
        password:{type:String, required:true,min:[6,"weak password"]},
        hpassword:{type:String},
        lastSeen:{type:Date, default:Date.now}
    }
)

const user = mongoose.model('Users',userSchema);
module.exports = user;