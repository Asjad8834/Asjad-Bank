const mongoose = require('mongoose');

const connectDb = async () =>{
  try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connected");
  }
  catch(error){
    console.log(error);
  }
}

module.exports = connectDb;

// we can also write the above code in a different way like this

/*
function connectDB(){
  mongoose.connect(process.env.MONGO_URI)
  .then(()=>{
    console.log("Database Connected");
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
}
  */