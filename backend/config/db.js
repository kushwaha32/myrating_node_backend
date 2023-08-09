const mongoose = require("mongoose");



// mongodb connection function
const connectDb = async() => {
    try {
      const data = await mongoose.connect("mongodb+srv://raj639kushwaha:XXiEtAq9g3eZz8Y9@myrating.c1njore.mongodb.net/?retryWrites=true&w=majority", {
                useNewUrlParser: true, 
                useUnifiedTopology: true 
         })

        console.log(`connected width mongodb with data: ${data}`)
    } catch (error) {
        console.log(error);
    }
    
}

module.exports = connectDb;

