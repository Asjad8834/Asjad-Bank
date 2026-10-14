const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({

  email:{
    type: String,
    required: [true, "Please provide an email"],
    trim: true,
    lowercase: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email"],
      unique: [true, "Email already exists"]
  },

  name:{
    type: String,
    required: [true, "Please provide a name"]
  },

  password:{
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, "Password must be at least 6 characters long"],
    //select: false does not return the password when we query the data from a database only shows when we specifically want it to show up 
  },

  systemUser:{
    type: Boolean,
    default: false,
    immuatbale: true, //this means that this field cannot be changed once it is set
    select: false //this means that this field will not be returned when we query the data from the database
  }

}, {timestamps: true});

// Hash the password before saving the user
// we do this because we don't want to store the password in plain text in the database. We want to store a hashed version of the password so that even if someone gains access to the database, they won't be able to see the user's password.
userSchema.pre("save", async function(){
  
  if(!this.isModified("password")){
    return;
  }

  //if we want the database itself to automatically hash password without doing it ourself in the controllers we will use this
  //const hash = await bcrypt.hash(this.password, 10);
  //this.password = hash;

});

//we do this because we want to compare the password that the user provides during login with the hashed password that is stored in the database. We can't compare the two directly because the hashed password is not the same as the plain text password. So we use bcrypt to compare the two passwords and return true if they match and false if they don't.
userSchema.methods.comparePassword = async function(password){
  return await bcrypt.compare(password, this.password);
}


const userModel = mongoose.model("user", userSchema);

module.exports = userModel;