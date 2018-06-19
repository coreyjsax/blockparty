const mongoose = require('mongoose');

var artistSchema = new mongoose.Schema({
   name: String,
   genre: String,
   description: String,
   question: String,
   booked: {
       type: String,
       default: "Not Booked"
   },
   info: {
       type: Boolean,
       default: false
   },
   submitted: {
      type: Date,
      default: Date.now
   },
   video: String,
   author: {
       id: {
           type: mongoose.Schema.Types.ObjectId, 
           ref: "User"
       },
       username: String,
   },
   ratings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Rating"
        }
    ], 
    
});



module.exports = mongoose.model("Artist", artistSchema);
