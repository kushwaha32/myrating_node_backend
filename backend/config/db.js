const mongoose = require("mongoose");



// mongodb connection function
const connectDb = async() => {
    try {
      const data = await mongoose.connect(process.env.DB_CONNECTION, {
                useNewUrlParser: true, 
                useUnifiedTopology: true 
         })

        console.log(`connected width mongodb with data: ${data}`)
    } catch (error) {
        console.log(error);
    }
    
}

module.exports = connectDb;

